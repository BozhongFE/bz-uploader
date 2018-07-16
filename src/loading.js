import './style.css';

class Loading {
  constructor() {
    this.el = '';
    this.text = '';
    this.isShow = false; // 是否是显示状态
    this.init();
  }

  init() {
    this.create();
  }

  create() {
    const template = `
      <div class="bz-uploading-box">
        <div class="bz-uploading-bounce">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
        <div class="bz-uploading-text"></div>
      </div>`;
    const div = document.createElement('div');
    div.id = 'bz-uploading';
    div.className = 'bz-uploading hide';
    div.innerHTML = template;
    document.body.appendChild(div);

    this.el = div;
    this.text = div.querySelector('.bz-uploading-text');
  }

  destroy() {
    this.el.parentElement.removeChild(this.el);
  }

  show(message = '') {
    if (!this.isShow) {
      this.el.classList.remove('hide');
      this.isShow = true;
    }
    this.text.innerHTML = message;
  }

  hide() {
    this.el.classList.add('hide');
    this.text.innerHTML = '';
    this.isShow = false;
  }
}

export default Loading;
