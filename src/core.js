import ObjectAssign from 'object-assign';
import Promise from 'promise-polyfill';
import compress from './compress';
import Loading from './loading';
import api from './api';
import {
  logger,
  debug,
  compareAppVersion,
  isIE,
} from './util';

if (!window.Promise) {
  window.Promise = Promise;
}
Object.assign = ObjectAssign;

const UA = navigator.userAgent;
const yunjiReg = /bz-tracker-(android|ios)/;
const isYunji = yunjiReg.test(UA);
const isAndroidApp = /bz-([A-Za-z]{1,20})-android/.test(UA);
const isIosApp = /bz-([A-Za-z]{1,20})-ios/.test(UA);
const isApp = isAndroidApp || isIosApp;
const isOldIe = isIE(9) || isIE(8);

// 检查文件是否为 image
function isImage(file) {
  const type = file.type;
  if (type && type.indexOf('image') === -1) {
    return false;
  }
  return true;
}

// 筛选出符号规则的图片
function filterFile(files, limit) {
  const rightFiles = [];
  const filesLength = files.length;

  for (let i = 0; i < filesLength; i += 1) {
    const file = files[i];
    const name = file.name;
    if (!isImage(file)) {
      logger(`${name} 不是图片，只能上传图片哦`);
    } else if (limit && file.size / 1024 > limit) {
      logger(`${name} 图片太大了哦，请上传小于 ${limit / 1024}M 的图片`);
    } else {
      rightFiles.push({
        file,
        isBase64: false,
      });
    }
  }
  return rightFiles;
}

function runAppFunction(functionName, ...params) {
  const namespace = window.bzinner && window.bzinner[functionName] ? 'bzinner' : 'Crazy';
  const hasArgs = params.length > 0;
  let args = params;

  try {
    if (isIosApp) {
      if (!hasArgs) {
        args = [null];
      }
      window.webkit.messageHandlers[functionName].postMessage(...args);
    } else {
      if (!hasArgs) {
        args = [];
      }
      window[namespace][functionName](...args);
    }
  } catch (error) {
    debug('协议调用错误', functionName);
    debug(error);
  }
}

class Uploader {
  constructor(options) {
    this.opts = Object.assign({}, {
      el: '', // 绑定上传按钮
      api: '', // 自定义图片上传接口
      mode: 'single', // 上传模式，single 单张上传，multiple 多张上传
      isCompress: false, // 是否压缩图片
      compressLimit: 600, // 超过这个大小才进行压缩，默认 600，单位 kb
      compressRatio: 0.6, // 压缩比例
      isShowProgress: true, // 是否显示进度
      loadingFontSize: '16px', // loading 的默认根字体大小，显示进度时有效
      imgLimit: 9, // 限制张数
      watermark: 0, // 0 不要水印，1 添加水印，孕迹 4.4 及以上版本有效
      maxFileSize: 3000, // 最大文件大小，默认 3000，单位 kb
      // upload 函数，用于图片上传，默认用 src/ajax/ajax.js，依赖 jQuery / Zepto
      upload: '',
      beforeAjax() {}, // 每张图片上传前执行的函数
      onProgress() {}, // 返回当前进度，压缩 or 上传
      // IE9 及以下版本只有以下几项功能有效
      onSuccess() {}, // 每一张图片上传成功后的回调
      onError() {}, // 每一张图片上传失败后的回调
      onFinish() {}, // 全部图片上传完成之后的回调
    }, options);
    this.opts.options = Object.assign({}, {
      class: 'user',
    }, options.options);
    this.progress = () => {};
    this.init();

    return this;
  }

  // APP 图片上传
  static appUpload(limit, watermark, callback) {
    // 如果是 4.4.0 以上版本的孕迹，则使用新的协议
    if (isYunji && compareAppVersion('4.4.0')) {
      event.preventDefault();
      const json = [limit, watermark];
      runAppFunction('getBZAlbumMulti', json);
    } else if (isAndroidApp) {
      event.preventDefault();
      runAppFunction('uploadImage', api.normal, 'tmp');
    } else if (typeof callback === 'function') {
      callback();
    }
  }

  // 将 APP 返回的数据格式化成与 WEB 上传相同的格式
  static formatAppResult(results) {
    if (results) {
      const firstItem = results[0];
      if (typeof firstItem === 'string') {
        return results.map(item => ({
          code: 0,
          url: item,
          msg: 'success',
        }));
      } else if (typeof results.error_code !== 'undefined') {
        const code = results.error_code;
        return [{
          code,
          url: code === 0 ? results.data.url : '',
          msg: code === 0 ? 'success' : results.error_message,
        }];
      }
      return results;
    }
    return results;
  }

  init() {
    const opts = this.opts;

    if (this.opts.isShowProgress && !isOldIe) {
      this.loading = new Loading();
      this.loading.el.style.fontSize = this.opts.loadingFontSize;
      this.progress = this.loading.show.bind(this.loading);
    }

    // 当模式设置为单张时，限制张数为 1 张，用于 APP
    if (opts.mode === 'single') {
      this.opts.imgLimit = 1;
    }

    if (typeof opts.upload !== 'function') {
      opts.upload = () => {};
    }

    this.createInput();
    this.listener();

    const appCallback = (json) => {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      debug(json);
      this.opts.onFinish(Uploader.formatAppResult(data));
    };

    // APP 上传回调
    window.uploadImageCallback = appCallback;

    // 孕迹 4.4 以上版本的回调
    window.getBZAlbumMultiResult = appCallback;
  }

  createInput() {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const el = document.querySelector(this.opts.el);

    form.className = 'bz-upload';
    form.method = 'POST';
    input.type = 'file';
    input.name = 'file';
    input.className = 'bz-upload-input';
    input.accept = 'image/gif,image/jpeg,image/jpg,image/png';

    el.style.position = 'relative';

    if (isOldIe) {
      const domain = window.location.host.replace(/\w+\./, '');
      const iframeId = `iframe_${Date.now()}`;
      const iframe = document.createElement('iframe');
      const params = this.opts.options;
      let tpl = '';

      // 将提交参数添加到 form 表单
      Object.keys(params).forEach((key) => {
        tpl += `<input type="hidden" name="${key}" value="${params[key]}" />`;
      });
      form.innerHTML = tpl;

      // 指定一个与 iframe 相同的域名
      document.domain = domain;
      iframe.style.display = 'none';
      iframe.name = iframeId;
      form.target = iframeId;
      form.action = `${api.normal}?__format=iframe`;
      form.enctype = 'multipart/form-data';
      el.appendChild(iframe);
      this.iframe = iframe;
    }

    if (this.opts.mode === 'multiple' && !isOldIe) {
      input.multiple = true;
    }

    form.appendChild(input);
    el.appendChild(form);

    this.input = input;
    this.form = form;
    return input;
  }

  destroy() {
    if (typeof this.loading !== 'undefined') {
      this.loading.destroy();
    }

    this.form.parentElement.removeChild(this.form);
    if (this.iframe) {
      this.iframe.parentElement.removeChild(this.iframe);
    }
  }

  listener() {
    const self = this;
    const input = this.input;
    const opts = this.opts;
    const params = opts.options; // 图片上传参数，传给后端 API
    let notScheme = false;

    // 图片上传队列
    function uploadQueue(fileList) {
      const filesLength = fileList.length;
      const results = [];
      let uploadIndex = 0;

      function uploadFile() {
        if (uploadIndex < filesLength) {
          const fileItem = fileList[uploadIndex];
          const isBase64 = fileItem.isBase64;
          const numberText = `(${uploadIndex + 1}/${filesLength})`; // 正在上传第几张图片，格式：(1/9)
          let file = fileItem.file;

          if (isBase64) {
            file = file.replace('data:image/jpeg;base64,', '');
            params.contentType = 'image/jpeg';
          }
          params.file = file;

          const uploadOptions = {
            api: opts.api,
            isBase64,
            beforeAjax: opts.beforeAjax,
            progress(msg) {
              self.progress(msg);
              opts.onProgress(msg);
            },
            onSuccess(url) {
              opts.onSuccess(url, uploadIndex);

              results.push({
                code: 0,
                url,
                msg: 'success',
              });
            },
            onError(err) {
              opts.onError(err, uploadIndex);

              results.push({
                code: 500,
                url: '',
                msg: err,
              });
            },
            onComplete() {
              uploadIndex += 1;
              uploadFile();
            },
          };

          if (filesLength > 1) {
            uploadOptions.totalText = `<br>${numberText}`;
          }

          try {
            opts.upload(params, uploadOptions);
          } catch (error) {
            debug('上传错误：', error);
          }
        } else {
          // 全部上传完成，返回结果，隐藏 loading
          opts.onFinish(results);
          self.loading.hide();
        }
      }

      uploadFile();
    }

    // 监听绑定按钮
    input.addEventListener('click', (event) => {
      // 在 APP 内，并且有图片上传协议
      if (isApp && !notScheme) {
        event.preventDefault();
        Uploader.appUpload(opts.imgLimit, opts.watermark, () => {
          notScheme = true;
          input.click();
        });
      }
    }, false);

    // 监听 input 的状态
    input.addEventListener('change', () => {
      const files = input.files;

      // 如果是 IE9 及其以下版本的浏览器，不进行其他操作，直接提交表单
      if (isOldIe) {
        this.form.submit();
        return;
      }

      if (files.length > opts.imgLimit) {
        logger(`最多上传${opts.imgLimit}张哦`);
        return;
      }

      // 筛选出符合条件的文件
      const rightFiles = filterFile(files, opts.maxFileSize);

      // 是否需要压缩
      if (opts.isCompress) {
        const compressQueue = []; // 图片压缩队列

        // 将图片放入压缩队列
        rightFiles.forEach((fileItem, index) => {
          compressQueue.push(compress({
            file: fileItem.file,
            compressRatio: opts.compressRatio,
            compressLimit: opts.compressLimit,
            progress(msg) {
              self.progress(msg);
              opts.onProgress(msg);
            },
            totalText: `<br>(${index + 1}/${rightFiles.length})`,
          }));
        });

        // 逐个进行压缩，全部压缩后添加文件列表到上传队列
        Promise.all(compressQueue)
          .then(uploadQueue)
          .catch((err) => {
            debug('error', err);
          });
      } else {
        // 没有开启压缩，直接进入上传队列
        uploadQueue(rightFiles);
      }
    }, false);

    if (isOldIe) {
      const iframe = this.iframe;
      const loadFn = () => {
        iframe.removeEventListener('load', loadFn, false);
        iframe.addEventListener('load', () => {
          const iframeDoc = iframe.contentWindow.document;
          const textData = iframeDoc.querySelector('textarea').innerText;
          const data = JSON.parse(textData);

          if (data.error_code === 0) {
            const dd = data.data;
            const url = `${dd.url}?t=${Date.now()}`;
            opts.onSuccess(url, 0);
            opts.onFinish([{
              url,
              code: 0,
              msg: 'success',
            }]);
          } else {
            opts.onError(data.error_message);
          }
          iframeDoc.body.innerHTML = '';
        });
      };
      iframe.addEventListener('load', loadFn, false);
    }
  }
}

export default Uploader;
