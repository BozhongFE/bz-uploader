import { getLink } from './util';

const api = {
  normal: `https:${getLink('upfile')}/upload.php`,
  base64: `https:${getLink('upfile')}/upload_base64.php`,
};

export default api;
