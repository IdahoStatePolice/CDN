class Countdown {
  static #defaultSelector = '[data-isp-toggle="countdown"]'

  static #defaultSettings = {
    maxLength: 255,
    label: 'Characters remaining: ',
    labelConfig: {
      name: 'div',
      class: 'form-text'
    },
    showAll: false
  }

  static #initializedEls = new Map();

  /**
   * @param {string | Element} el - A string or a DOM element
   * @param {Object} [options] - Optional options object
   */
  constructor(el, options) {
    this.inputEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (Countdown.#initializedEls.has(this.inputEl)) {
      Countdown.#initializedEls.get(this.inputEl).destroy();
    }

    this.settings = Countdown.#getSettings(this.inputEl, options);
    this.labelEl = Countdown.#buildLabelEl(this.inputEl, this.settings);
    this.spanEl = this.labelEl.firstElementChild;

    this.inputEl.maxLength = this.settings.maxLength;
    this.inputEl.addEventListener('input', Countdown.#onInput);

    if (this.settings.showAll) {
      this.borderOffset = parseFloat(window.getComputedStyle(this.inputEl).borderWidth) * 2;
      this.minHeight = this.inputEl.clientHeight + this.borderOffset;
    }

    Countdown.#initializedEls.set(this.inputEl, this);
    this.inputEl.dispatchEvent(new Event('input', {bubbles: true}));
  }

  destroy() {
    this.inputEl.removeEventListener('input', Countdown.#onInput);
    this.labelEl.remove();
    Countdown.#initializedEls.delete(this.inputEl);
  }

  static initAll(selector, options) {
    const els = document.querySelectorAll(selector || Countdown.#defaultSelector);
    return [...els].map(el => new Countdown(el, options));
  }

  static #getSettings(el, options) {
    const elOptions = {};
    if (el.maxLength > 0) {
      elOptions.maxLength = el.maxLength;
    }
    if (el.dataset.label) {
      elOptions.label = el.dataset.label;
    }
    if (el.dataset.showAll === 'true') {
      elOptions.showAll = true;
    }

    return Object.assign({}, Countdown.#defaultSettings, options, elOptions);
  }

  static #buildLabelEl(el, settings) {
    const labelConfig = settings.labelConfig;
    el.insertAdjacentHTML('afterend', `
      <${labelConfig.name} class="${labelConfig.class}">
        ${settings.label}<span>${settings.maxLength}</span>
      </${labelConfig.name}>
    `);
    return el.nextElementSibling;
  }

  static #onInput(e) {
    const countdown = Countdown.#initializedEls.get(e.target);
    countdown.spanEl.textContent = (e.target.maxLength - e.target.value.length).toString();

    if (countdown.settings.showAll) {
      countdown.inputEl.style.height = 'auto';
      const scrollHeight = countdown.inputEl.scrollHeight + countdown.borderOffset;
      const height = Math.max(scrollHeight, countdown.minHeight);
      countdown.inputEl.style.height = height + 'px';
    }
  }
}

export { Countdown }