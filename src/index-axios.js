import axiosUpload from './ajax/axios';
import UploaderCore from './core';

class Uploader extends UploaderCore {
  constructor(options) {
    const opts = options;
    if (typeof opts.upload !== 'function') {
      opts.upload = axiosUpload;
    }
    super(opts);
  }
}

export default Uploader;
