# bz-uploader

播种网图片上传模块

## 打包

```shell
npm run build
```

## 使用

Using Require.js

```javascript
// 依赖 jQuery 或 Zepto
require(['mod/bz-uploader/0.1.0/bz-uploader'], (Uploader) {
  new Uploader({
    el: '#btn',
    onSuccess: function (url) {
      console.log(url);
    },
    onFinish: function (results) {
      console.log(JSON.stringify(results));
    },
  });
});

// 无依赖，需要自行传入 upload 函数
require(['mod/bz-uploader/0.1.0/bz-uploader-core'], (Uploader) {
  new Uploader({
    el: '#btn',
    onSuccess: function (url) {
      console.log(url);
    },
    onFinish: function (results) {
      console.log(JSON.stringify(results));
    },
    upload: customFunction,
  });
});
```

Using npm

```shell
npm install https://github.com/BozhongFE/bz-uploader#v0.1.0
```

```javascript
// 引用方式1：依赖 jQuery 或 Zepto
import Uploader from 'bz-uploader';
// 引用方式2：依赖 axios
import Uploader from 'bz-uploader/dist/bz-uploader-axios.esm';
// 引用方式3：无依赖，需要自行传入 upload 函数
import Uploader from 'bz-uploader/dist/bz-uploader-core.esm';

new Uploader({
  el: '#btn',
  onSuccess(url) {
    console.log(url);
  },
});
```

## 配置参数

### new Uploader(options)

**options**

`el` (string) 必填，绑定上传按钮

`api` (string) 自定义图片上传接口

`mode` (string) 上传模式，single 单张上传，multiple 多张上传 **Default:** 'single'

`isCompress` (boolean) 是否压缩图片 **Default:** false

`compressLimit` (number) 超过这个大小才进行压缩，单位 kb **Default:** 600

`compressRatio` (number) 压缩比例 **Default:** 0.6

`isShowProgress` (boolean) 是否显示上传或压缩进度 **Default:** true

`loadingFontSize` (string) loading 的默认根字体大小，显示进度时有效 **Default:** '16px'

`imgLimit` (number) 限制每次上传张数 **Default:** 9

`watermark` (number) 0 不要水印，1 添加水印，孕迹 4.4 及以上版本有效，直接传入 APP 协议 **Default:** 0

`maxFileSize` (number) 最大文件大小，单位 kb **Default:** 3000

`upload` (Function) 自定义图片上传函数，默认用 src/ajax/ajax.js，依赖 jQuery / Zepto

`beforeAjax` (Function) 每张图片上传前运行的函数

`onProgress` (Function) (message)
  
  压缩或者上传进度，message 为当前压缩或者上传进度的文本

  **IE9 及以下版本只有以下几项功能有效**

`onSuccess` (Function) (url, imageIndex)

  每一张图片上传成功后的回调，url 为上传后服务器返回的链接，imageIndex 为第几张图片

`onError` (Function) (errorMessage)

  每一张图片上传失败后的回调

`onFinish` (Function) (results)

  全部图片上传完成之后的回调，results 为对象数组格式：

```javascript
  [
    // 上传成功
    {
      code: 0,
      url: 'http://example.com/example.png',
      msg: 'success'
    },
    // 上传失败
    {
      code: 500, // 500 或其他非 0 数值
      url: '',
      msg: 'Example Error Message'
    }
  ]
```

`options` (Object) 跟图片一起发送给后端的参数 **Default:** { class: 'user' }

以上没注明必填的项均为可选项。

**兼容情况**

下表为**支持图片上传协议的 APP 内**组件参数兼容情况，没写的参数均不支持

参数名 | 兼容版本
---- | ----
el | 全版本
mode | 孕迹（iOS / Android）4.4.0 以上
imgLimit | 孕迹（iOS / Android）4.4.0 以上
watermark | 孕迹（iOS / Android）4.4.0 以上
onFinish | 全版本

## 实例方法

### destroy()

销毁上传组件相关 DOM