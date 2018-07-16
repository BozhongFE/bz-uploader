import defaultOptions from './config';
import apiList from '../api';

function checkLib() {
  if (typeof $ === 'undefined') {
    window.alert('请先加载 jQuery 或 Zepto');
    return false;
  }
  return true;
}
checkLib();

function upload(params, options) {
  const opts = Object.assign({}, defaultOptions, options);
  const isBase64 = opts.isBase64;
  let api = '';
  let sendData = {};

  if (opts.api) {
    api = opts.api;
  } else if (isBase64) {
    api = apiList.base64;
  } else {
    api = apiList.normal;
  }

  opts.beforeAjax();

  const ajaxOptions = {
    type: 'POST',
    url: api,
    xhrFields: {
      withCredetials: true,
    },
    xhr() {
      const xhr = new window.XMLHttpRequest();

      if (xhr.upload) {
        opts.progress(`上传中...${opts.totalText}`);
        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable) {
            const percentComplete = Math.ceil((evt.loaded / evt.total) * 100);
            opts.progress(`上传进度：${percentComplete}% ${opts.totalText}`);
          }
        }, false);
      }

      return xhr;
    },
    success(data) {
      if (data.error_code === 0) {
        const dd = data.data;
        const url = `${dd.url}?t=${Date.now()}`;
        opts.onSuccess(url);
      } else {
        opts.onError(data.error_message);
      }
    },
    error(err) {
      opts.onError(err);
    },
    complete(...args) {
      opts.onComplete(...args);
    },
  };

  if (isBase64) {
    sendData = params;
  } else {
    sendData = new FormData();
    Object.keys(params).forEach((key) => {
      sendData.append(key, params[key]);
    });

    ajaxOptions.processData = false; // 告诉 jQuery 不要去处理发送的数据
    ajaxOptions.contentType = false; // 告诉 jQuery 不要去设置 Content-Type 请求头
  }

  ajaxOptions.data = sendData;

  $.ajax(ajaxOptions);
}

export default upload;
