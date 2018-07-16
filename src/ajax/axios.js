import axios from 'axios';
import qs from 'qs';
import defaultOptions from './config';
import apiList from '../api';

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

  if (isBase64) {
    sendData = qs.stringify(params);
  } else {
    sendData = new FormData();
    Object.keys(params).forEach((key) => {
      console.log(params[key]);
      sendData.append(key, params[key]);
    });
  }

  axios.post(api, sendData, {
    withCredentials: true,
    onUploadProgress(evt) {
      if (evt.lengthComputable) {
        const percentComplete = Math.ceil((evt.loaded / evt.total) * 100);
        opts.progress(`上传进度：${percentComplete}% ${opts.totalText}`);
      }
    },
  }).then((rep) => {
    const data = rep.data;

    if (data.error_code === 0) {
      const dd = data.data;
      const url = `${dd.url}?t=${Date.now()}`;
      opts.onSuccess(url);
    } else {
      opts.onError(data.error_message);
    }

    opts.onComplete(data);
  }).catch((err) => {
    opts.onComplete(err);
  });
}

export default upload;
