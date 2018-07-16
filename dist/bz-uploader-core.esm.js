import ObjectAssign from 'object-assign';
import Promise from 'promise-polyfill';

function compress(options) {
  var opts = Object.assign({}, {
    file: '',
    compressLimit: 600, // 默认为 600kb
    compressRatio: 0.6, // 压缩比例
    progress: function progress() {},
    totalText: '',
  }, options);
  var file = opts.file;
  var isOversize = file.size / 1000 > opts.compressLimit;

  function readerFile(resolve) {
    opts.progress(("压缩中..." + (opts.totalText)));
    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function (event) {
      var result = event.target.result;
      var image = new Image();
      var canvas = document.createElement('canvas');

      image.onload = function () {
        var originSize = image.src.length; // 原始图片大小
        var width = image.width;
        var height = image.height;

        // 图片压缩到 400w 像素以下
        var ratio = (width * height) / 4000000;

        // 如果图片大于 400w 像素
        if (ratio > 1) {
          // (width / √ratio) x (height / √ratio) = 4000000;
          ratio = Math.sqrt(ratio);
          width /= ratio;
          height /= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');

        // canvas 默认底色为黑色，半透明 png 转 jpg 需要先绘制一层白底色
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        var dataUrl = canvas.toDataURL('image/jpeg', opts.compressRatio);
        console.log('原始大小：', originSize);
        console.log('压缩后大小：', dataUrl.length);

        resolve({
          file: dataUrl,
          isBase64: true,
        });
        opts.progress(("压缩完成" + (opts.totalText)));
      };
      image.src = result;
    };
  }

  // 判断文件大小是否需要压缩
  if (isOversize) {
    return new Promise(readerFile);
  }

  // 不需要压缩的直接返回源文件
  return new Promise(function (resolve) {
    resolve({
      file: file,
      isBase64: false,
    });
  });
}

function styleInject(css, ref) {
  if ( ref === void 0 ) { ref = {}; }
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".bz-upload{bottom:0;height:100%;left:0;opacity:0;overflow:hidden;position:absolute;width:100%}.bz-upload-input{font-size:0;font-size:100px\\9;height:100%;height:130%\\9;left:0;left:auto\\9;position:absolute;right:0\\9;top:0;width:100%;width:200%\\9}.bz-uploading{-webkit-align-items:center;-webkit-justify-content:center;align-items:center;display:-webkit-flex;display:flex;font-size:16px;height:100%;justify-content:center;left:0;position:absolute;top:0;width:100%}.bz-uploading.hide{display:none}.bz-uploading-box{-webkit-align-items:center;-webkit-flex-direction:column;-webkit-justify-content:center;align-items:center;background-color:rgba(0,0,0,.6);border-radius:.5em;display:-webkit-flex;display:flex;flex-direction:column;height:8em;justify-content:center;width:8em}.bz-uploading-text{color:#fff;font-size:.8em;line-height:1.4;text-align:center}.bz-uploading-bounce{margin:1em 0;text-align:center;width:5em}.bz-uploading-bounce>div{-webkit-animation:bzBouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation:bzBouncedelay 1.4s infinite ease-in-out;animation-fill-mode:both;background-color:#f2f2f2;border-radius:100%;display:inline-block;height:.6em;width:.6em}.bz-uploading-bounce .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.bz-uploading-bounce .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bzBouncedelay{0%,80%,to{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bzBouncedelay{0%,80%,to{-webkit-transform:scale(0);transform:scale(0)}40%{-webkit-transform:scale(1);transform:scale(1)}}";
styleInject(css);

var Loading = function Loading() {
  this.el = '';
  this.text = '';
  this.isShow = false; // 是否是显示状态
  this.init();
};

Loading.prototype.init = function init () {
  this.create();
};

Loading.prototype.create = function create () {
  var template = "\n      <div class=\"bz-uploading-box\">\n        <div class=\"bz-uploading-bounce\">\n          <div class=\"bounce1\"></div>\n          <div class=\"bounce2\"></div>\n          <div class=\"bounce3\"></div>\n        </div>\n        <div class=\"bz-uploading-text\"></div>\n      </div>";
  var div = document.createElement('div');
  div.id = 'bz-uploading';
  div.className = 'bz-uploading hide';
  div.innerHTML = template;
  document.body.appendChild(div);

  this.el = div;
  this.text = div.querySelector('.bz-uploading-text');
};

Loading.prototype.destroy = function destroy () {
  this.el.parentElement.removeChild(this.el);
};

Loading.prototype.show = function show (message) {
    if ( message === void 0 ) message = '';

  if (!this.isShow) {
    this.el.classList.remove('hide');
    this.isShow = true;
  }
  this.text.innerHTML = message;
};

Loading.prototype.hide = function hide () {
  this.el.classList.add('hide');
  this.text.innerHTML = '';
  this.isShow = false;
};

function getLink(prefix, productPrefix) {
  var host = window.location.host;
  var prodPrefix = productPrefix || prefix;

  if (host.indexOf('office') !== -1) {
    return ("//" + prefix + ".office.bzdev.net");
  } else if (host.indexOf('online') !== -1) {
    return ("//" + prefix + ".online.seedit.cc");
  }
  return ("//" + prodPrefix + ".bozhong.com");
}

function isIE(ver) {
  if ( ver === void 0 ) ver = 'all';

  if (ver === 'all') {
    return ('ActiveXObject' in window);
  }
  var b = document.createElement('b');
  b.innerHTML = "<!--[if IE " + ver + "]><i></i><![endif]-->";
  return b.getElementsByTagName('i').length === 1;
}

// 判断传入版本是否大于 APP 当前版本
function compareAppVersion(version) {
  var verArray = version.split('.');
  var currVerArray = navigator.userAgent.match(/bz-([A-Za-z]{1,20})-(android|ios)-(\d+\.\d+\.\d+)/i)[3].split('.');
  var flag = true; // 当前版本是否大于等于传入版本

  for (var i = 0; i < 3; i += 1) {
    if (typeof verArray[i] === 'undefined') {
      verArray[i] = 0;
    }

    var currNum = parseInt(currVerArray[i], 10);
    var inputNum = parseInt(verArray[i], 10);

    if (currNum < inputNum) {
      flag = false;
      break;
    } else if (currNum > inputNum) {
      flag = true;
      break;
    }
  }
  return flag;
}

function logger() {
  var msgs = [], len = arguments.length;
  while ( len-- ) msgs[ len ] = arguments[ len ];

  alert(msgs.join(' '));
}

function debug() {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  console.log.apply(console, ['[DEBUG]:' ].concat( args));
}

var api = {
  normal: ((getLink('upfile')) + "/upload.php"),
  base64: ((getLink('upfile')) + "/upload_base64.php"),
};

if (!window.Promise) {
  window.Promise = Promise;
}
Object.assign = ObjectAssign;

var UA = navigator.userAgent;
var yunjiReg = /bz-tracker-(android|ios)/;
var isYunji = yunjiReg.test(UA);
var isAndroidApp = /bz-([A-Za-z]{1,20})-android/.test(UA);
var isIosApp = /bz-([A-Za-z]{1,20})-ios/.test(UA);
var isApp = isAndroidApp || isIosApp;
var isOldIe = isIE(9) || isIE(8);

// 检查文件是否为 image
function isImage(file) {
  var type = file.type;
  if (type && type.indexOf('image') === -1) {
    return false;
  }
  return true;
}

// 筛选出符号规则的图片
function filterFile(files, limit) {
  var rightFiles = [];
  var filesLength = files.length;

  for (var i = 0; i < filesLength; i += 1) {
    var file = files[i];
    var name = file.name;
    if (!isImage(file)) {
      logger((name + " 不是图片，只能上传图片哦"));
    } else if (limit && file.size / 1024 > limit) {
      logger((name + " 图片太大了哦，请上传小于 " + (limit / 1024) + "M 的图片"));
    } else {
      rightFiles.push({
        file: file,
        isBase64: false,
      });
    }
  }
  return rightFiles;
}

function runAppFunction(functionName) {
  var ref, ref$1;

  var params = [], len = arguments.length - 1;
  while ( len-- > 0 ) params[ len ] = arguments[ len + 1 ];
  var namespace = window.bzinner && window.bzinner[functionName] ? 'bzinner' : 'Crazy';
  var hasArgs = params.length > 0;
  var args = params;

  try {
    if (isIosApp) {
      if (!hasArgs) {
        args = [null];
      }
      (ref = window.webkit.messageHandlers[functionName]).postMessage.apply(ref, args);
    } else {
      if (!hasArgs) {
        args = [];
      }
      (ref$1 = window[namespace])[functionName].apply(ref$1, args);
    }
  } catch (error) {
    debug('协议调用错误', functionName);
    debug(error);
  }
}

var Uploader = function Uploader(options) {
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
    beforeAjax: function beforeAjax() {}, // 每张图片上传前执行的函数
    onProgress: function onProgress() {}, // 返回当前进度，压缩 or 上传
    // IE9 及以下版本只有以下几项功能有效
    onSuccess: function onSuccess() {}, // 每一张图片上传成功后的回调
    onError: function onError() {}, // 每一张图片上传失败后的回调
    onFinish: function onFinish() {}, // 全部图片上传完成之后的回调
  }, options);
  this.opts.options = Object.assign({}, {
    class: 'user',
  }, options.options);
  this.progress = function () {};
  this.init();

  return this;
};

// APP 图片上传
Uploader.appUpload = function appUpload (limit, watermark, callback) {
  // 如果是 4.4.0 以上版本的孕迹，则使用新的协议
  if (isYunji && compareAppVersion('4.4.0')) {
    event.preventDefault();
    var json = [limit, watermark];
    runAppFunction('getBZAlbumMulti', json);
  } else if (isAndroidApp) {
    event.preventDefault();
    runAppFunction('uploadImage', api.normal, 'tmp');
  } else if (typeof callback === 'function') {
    callback();
  }
};

// 将 APP 返回的数据格式化成与 WEB 上传相同的格式
Uploader.formatAppResult = function formatAppResult (results) {
  if (results) {
    var firstItem = results[0];
    if (typeof firstItem === 'string') {
      return results.map(function (item) { return ({
        code: 0,
        url: item,
        msg: 'success',
      }); });
    } else if (typeof results.error_code !== 'undefined') {
      var code = results.error_code;
      return [{
        code: code,
        url: code === 0 ? results.data.url : '',
        msg: code === 0 ? 'success' : results.error_message,
      }];
    }
    return results;
  }
  return results;
};

Uploader.prototype.init = function init () {
    var this$1 = this;

  var opts = this.opts;

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
    opts.upload = function () {};
  }

  this.createInput();
  this.listener();

  var appCallback = function (json) {
    var data = typeof json === 'string' ? JSON.parse(json) : json;
    debug(json);
    this$1.opts.onFinish(Uploader.formatAppResult(data));
  };

  // APP 上传回调
  window.uploadImageCallback = appCallback;

  // 孕迹 4.4 以上版本的回调
  window.getBZAlbumMultiResult = appCallback;
};

Uploader.prototype.createInput = function createInput () {
  var form = document.createElement('form');
  var input = document.createElement('input');
  var el = document.querySelector(this.opts.el);

  form.className = 'bz-upload';
  form.method = 'POST';
  input.type = 'file';
  input.name = 'file';
  input.className = 'bz-upload-input';
  input.accept = 'image/gif,image/jpeg,image/jpg,image/png';

  el.style.position = 'relative';

  if (isOldIe) {
    var domain = window.location.host.replace(/\w+\./, '');
    var iframeId = "iframe_" + (Date.now());
    var iframe = document.createElement('iframe');
    var params = this.opts.options;
    var tpl = '';

    // 将提交参数添加到 form 表单
    Object.keys(params).forEach(function (key) {
      tpl += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + (params[key]) + "\" />";
    });
    form.innerHTML = tpl;

    // 指定一个与 iframe 相同的域名
    document.domain = domain;
    iframe.style.display = 'none';
    iframe.name = iframeId;
    form.target = iframeId;
    form.action = (api.normal) + "?__format=iframe";
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
};

Uploader.prototype.destroy = function destroy () {
  if (typeof this.loading !== 'undefined') {
    this.loading.destroy();
  }

  this.form.parentElement.removeChild(this.form);
  if (this.iframe) {
    this.iframe.parentElement.removeChild(this.iframe);
  }
};

Uploader.prototype.listener = function listener () {
    var this$1 = this;

  var self = this;
  var input = this.input;
  var opts = this.opts;
  var params = opts.options; // 图片上传参数，传给后端 API
  var notScheme = false;

  // 图片上传队列
  function uploadQueue(fileList) {
    var filesLength = fileList.length;
    var results = [];
    var uploadIndex = 0;

    function uploadFile() {
      if (uploadIndex < filesLength) {
        var fileItem = fileList[uploadIndex];
        var isBase64 = fileItem.isBase64;
        var numberText = "(" + (uploadIndex + 1) + "/" + filesLength + ")"; // 正在上传第几张图片，格式：(1/9)
        var file = fileItem.file;

        if (isBase64) {
          file = file.replace('data:image/jpeg;base64,', '');
          params.contentType = 'image/jpeg';
        }
        params.file = file;

        var uploadOptions = {
          api: opts.api,
          isBase64: isBase64,
          beforeAjax: opts.beforeAjax,
          progress: function progress(msg) {
            self.progress(msg);
            opts.onProgress(msg);
          },
          onSuccess: function onSuccess(url) {
            opts.onSuccess(url, uploadIndex);

            results.push({
              code: 0,
              url: url,
              msg: 'success',
            });
          },
          onError: function onError(err) {
            opts.onError(err, uploadIndex);

            results.push({
              code: 500,
              url: '',
              msg: err,
            });
          },
          onComplete: function onComplete() {
            uploadIndex += 1;
            uploadFile();
          },
        };

        if (filesLength > 1) {
          uploadOptions.totalText = "<br>" + numberText;
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
  input.addEventListener('click', function (event) {
    // 在 APP 内，并且有图片上传协议
    if (isApp && !notScheme) {
      event.preventDefault();
      Uploader.appUpload(opts.imgLimit, opts.watermark, function () {
        notScheme = true;
        input.click();
      });
    }
  }, false);

  // 监听 input 的状态
  input.addEventListener('change', function () {
    var files = input.files;

    // 如果是 IE9 及其以下版本的浏览器，不进行其他操作，直接提交表单
    if (isOldIe) {
      this$1.form.submit();
      return;
    }

    if (files.length > opts.imgLimit) {
      logger(("最多上传" + (opts.imgLimit) + "张哦"));
      return;
    }

    // 筛选出符合条件的文件
    var rightFiles = filterFile(files, opts.maxFileSize);

    // 是否需要压缩
    if (opts.isCompress) {
      var compressQueue = []; // 图片压缩队列

      // 将图片放入压缩队列
      rightFiles.forEach(function (fileItem, index) {
        compressQueue.push(compress({
          file: fileItem.file,
          compressRatio: opts.compressRatio,
          compressLimit: opts.compressLimit,
          progress: function progress(msg) {
            self.progress(msg);
            opts.onProgress(msg);
          },
          totalText: ("<br>(" + (index + 1) + "/" + (rightFiles.length) + ")"),
        }));
      });

      // 逐个进行压缩，全部压缩后添加文件列表到上传队列
      Promise.all(compressQueue)
        .then(uploadQueue)
        .catch(function (err) {
          debug('error', err);
        });
    } else {
      // 没有开启压缩，直接进入上传队列
      uploadQueue(rightFiles);
    }
  }, false);

  if (isOldIe) {
    var iframe = this.iframe;
    var loadFn = function () {
      iframe.removeEventListener('load', loadFn, false);
      iframe.addEventListener('load', function () {
        var iframeDoc = iframe.contentWindow.document;
        var textData = iframeDoc.querySelector('textarea').innerText;
        var data = JSON.parse(textData);

        if (data.error_code === 0) {
          var dd = data.data;
          var url = (dd.url) + "?t=" + (Date.now());
          opts.onSuccess(url, 0);
          opts.onFinish([{
            url: url,
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
};

export default Uploader;
