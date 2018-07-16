import upload from './ajax/ajax';
import UploaderCore from './core';

class Uploader extends UploaderCore {
  constructor(options) {
    const opts = options;
    if (typeof opts.upload !== 'function') {
      opts.upload = upload;
    }
    super(opts);
  }
}

export default Uploader;
