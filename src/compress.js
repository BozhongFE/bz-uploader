import Promise from 'promise-polyfill';

function compress(options) {
  const opts = Object.assign({}, {
    file: '',
    compressLimit: 600, // 默认为 600kb
    compressRatio: 0.6, // 压缩比例
    progress() {},
    totalText: '',
  }, options);
  const file = opts.file;
  const isOversize = file.size / 1000 > opts.compressLimit;

  function readerFile(resolve) {
    opts.progress(`压缩中...${opts.totalText}`);
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const result = event.target.result;
      const image = new Image();
      const canvas = document.createElement('canvas');

      image.onload = () => {
        const originSize = image.src.length; // 原始图片大小
        let width = image.width;
        let height = image.height;

        // 图片压缩到 400w 像素以下
        let ratio = (width * height) / 4000000;

        // 如果图片大于 400w 像素
        if (ratio > 1) {
          // (width / √ratio) x (height / √ratio) = 4000000;
          ratio = Math.sqrt(ratio);
          width /= ratio;
          height /= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // canvas 默认底色为黑色，半透明 png 转 jpg 需要先绘制一层白底色
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', opts.compressRatio);
        console.log('原始大小：', originSize);
        console.log('压缩后大小：', dataUrl.length);

        resolve({
          file: dataUrl,
          isBase64: true,
        });
        opts.progress(`压缩完成${opts.totalText}`);
      };
      image.src = result;
    };
  }

  // 判断文件大小是否需要压缩
  if (isOversize) {
    return new Promise(readerFile);
  }

  // 不需要压缩的直接返回源文件
  return new Promise((resolve) => {
    resolve({
      file,
      isBase64: false,
    });
  });
}

export default compress;
