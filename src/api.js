import { getLink } from './util';

const api = {
  normal: `${getLink('upfile')}/upload.php`,
  base64: `${getLink('upfile')}/upload_base64.php`,
};

export default api;
