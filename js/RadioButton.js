class RadioButton {
  static #defaultSelector = '[data-isp-toggle="radio-button"]';
  static #defaultSettings = {
    activeClass: 'active'
  };

  constructor(el, options) {
    this.groupEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (!this.groupEl.dataset.name) {
      throw new Error('Please provide a name for the radio button.');
    }

    this.settings = Object.assign({}, RadioButton.#defaultSettings, options);
    this.hiddenEl = RadioButton.#createHiddenEl(this.groupEl);
    this.btnEls = [...this.groupEl.querySelectorAll('button[value]')];

    for (const btnEl of this.btnEls) {
      btnEl.addEventListener('click', RadioButton.#getClickListener(this));
      if (btnEl.classList.contains(this.settings.activeClass)) {
        this.hiddenEl.value = btnEl.value;
      }
    }
  }

  static initAll(selector, options) {
    return [...document.querySelectorAll(selector || RadioButton.#defaultSelector)].map(el => new RadioButton(el, options));
  }

  static #createHiddenEl(groupEl) {
    groupEl.insertAdjacentHTML('afterend', `<input type="hidden" name="${groupEl.dataset.name}">`);
    return groupEl.nextElementSibling;
  }

  static #getClickListener(radioButton) {
    return function(e) {
      const btnEl = getBtn(e.target);

      if (btnEl.classList.contains(radioButton.settings.activeClass)) {
        btnEl.classList.remove(radioButton.settings.activeClass);
        radioButton.hiddenEl.value = '';
      }
      else {
        radioButton.btnEls.forEach(removeActiveClass);
        btnEl.classList.add(radioButton.settings.activeClass);
        radioButton.hiddenEl.value = btnEl.value;
      }
    }

    function getBtn(el) {
      let btn = el;

      while (!btn.matches('button[value]')) {
        btn = btn.parentElement;
      }

      return btn;
    }

    function removeActiveClass(btnEl) {
      btnEl.classList.remove(radioButton.settings.activeClass);
    }
  }
}

export { RadioButton };