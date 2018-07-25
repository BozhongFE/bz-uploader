function getLink(prefix, productPrefix) {
  const host = window.location.host;
  const prodPrefix = productPrefix || prefix;

  if (host.indexOf('office') !== -1) {
    return `//${prefix}.office.bzdev.net`;
  } else if (host.indexOf('online') !== -1) {
    return `//${prefix}.online.seedit.cc`;
  }
  return `//${prodPrefix}.bozhong.com`;
}

// 检查文件是否为 image
function isImage(file) {
  const type = file.type;
  if (type && type.indexOf('image') === -1) {
    return false;
  }
  return true;
}

// 判断是否是函数
function isFunc(functionName) {
  return typeof functionName === 'function';
}

function isIE(ver = 'all') {
  if (ver === 'all') {
    return ('ActiveXObject' in window);
  }
  const b = document.createElement('b');
  b.innerHTML = `<!--[if IE ${ver}]><i></i><![endif]-->`;
  return b.getElementsByTagName('i').length === 1;
}

// 判断传入版本是否大于 APP 当前版本
function compareAppVersion(version) {
  const verArray = version.split('.');
  const currVerArray = navigator.userAgent.match(/bz-([A-Za-z]{1,20})-(android|ios)-(\d+\.\d+\.\d+)/i)[3].split('.');
  let flag = true; // 当前版本是否大于等于传入版本

  for (let i = 0; i < 3; i += 1) {
    if (typeof verArray[i] === 'undefined') {
      verArray[i] = 0;
    }

    const currNum = parseInt(currVerArray[i], 10);
    const inputNum = parseInt(verArray[i], 10);

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

function debug(isDebug = false, ...args) {
  if (isDebug) {
    console.log.apply(console, ['[DEBUG]:', ...args]);
  }
}

export {
  getLink,
  isImage,
  isFunc,
  isIE,
  debug,
  compareAppVersion,
};
