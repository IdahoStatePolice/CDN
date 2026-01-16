/**
 * RadioButton settings object.
 *
 * ```
 * defaults = {
 *   activeClass: 'active'
 * }
 * ```
 *
 * @typedef {Object} RadioButtonSettings
 * @prop {string} [activeClass] - CSS class used to indicate a selected option.
 */

/**
 * Class to initialize buttons to act like radio buttons with unselect functions.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/radio-button.html|Radio Button Docs}
 */
class RadioButton {
  /**
   * The default settings for a RadioButton.
   * @type {RadioButtonSettings}
   */
  static #defaultSettings = {
    activeClass: 'active'
  };

  /**
   * All the initialized HTMLElements and their RadioButton objects.
   * @type {Map<HTMLElement, RadioButton>}
   */
  static #initializedEls = new Map();

  /**
   * HTML element containing all the buttons for the group.
   * @type {HTMLElement}
   */
  #groupEl;

  /**
   * HTML input element created by this object to submit the selected value.
   * @type {HTMLInputElement}
   */
  #hiddenEl;

  /**
   * Array of HTML button elements that make up the radio group.
   * @type {HTMLButtonElement[]}
   */
  #btnEls;

  /**
   * Settings for this RadioButton group.
   * @type {RadioButtonSettings}
   */
  #settings;

  /**
   * All the button elements with the click listener functions. (Kept for the destroy function.)
   * @type {Map<HTMLButtonElement, function>}
   */
  #listeners = new Map();

  /**
   * Constructs a new RadioButton object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {RadioButtonSettings} [options] - A RadioButtonSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/radio-button.html|Radio Button Docs}
   */
  constructor(el, options) {
    this.#groupEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (RadioButton.#initializedEls.has(this.#groupEl)) {
      RadioButton.#initializedEls.get(this.#groupEl).destroy();
    }

    if (!this.#groupEl.dataset.name) {
      throw new Error('Please provide a name for the radio button.');
    }

    this.#hiddenEl = RadioButton.#createHiddenEl(this.#groupEl);
    this.#btnEls = [...this.#groupEl.querySelectorAll('button[value]')];
    this.#settings = Object.assign({}, RadioButton.#defaultSettings, options);

    for (const btnEl of this.#btnEls) {
      const listener = e => this.#select(e.target.closest('button[value]'));
      btnEl.addEventListener('click', listener);
      this.#listeners.set(btnEl, listener);

      if (btnEl.classList.contains(this.#settings.activeClass)) {
        this.#hiddenEl.value = btnEl.value;
      }
    }

    RadioButton.#initializedEls.set(this.#groupEl, this);
  }

  /**
   * Removes event listeners and does general DOM cleanup to remove this RadioButton object.
   */
  destroy() {
    this.#hiddenEl.remove();

    for (const btnEl of this.#btnEls) {
      const listener = this.#listeners.get(btnEl);
      btnEl.removeEventListener('click', listener);
    }

    RadioButton.#initializedEls.delete(this.#groupEl);
  }

  #select(btnEl) {
    if (!btnEl) {
      return;
    }

    const activeClass = this.#settings.activeClass;

    if (btnEl.classList.contains(activeClass)) {
      btnEl.classList.remove(activeClass);
      this.#hiddenEl.value = '';
    }
    else {
      for (const el of this.#btnEls) {
        el.classList.remove(activeClass);
      }

      btnEl.classList.add(activeClass);
      this.#hiddenEl.value = btnEl.value;
    }
  }

  /**
   * A shortcut to do a mass initialization of any element that needs to be initialized.
   *
   * @param {string} [selector = '[data-isp-toggle="radio-button"]'] - Selector used to find all elements to initialize.
   * @param {RadioButtonSettings} [options] - A RadioButtonSettings object to use with each initialization.
   *
   * @returns {RadioButton[]} - The array of RadioButton objects that were initialized.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/radio-button.html|Radio Button Docs}
   */
  static initAll(selector = '[data-isp-toggle="radio-button"]', options) {
    const els = document.querySelectorAll(selector);
    return [...els].map(el => new RadioButton(el, options));
  }

  static #createHiddenEl(groupEl) {
    groupEl.insertAdjacentHTML('afterend', `<input type="hidden" name="${groupEl.dataset.name}">`);
    return groupEl.nextElementSibling;
  }
}

export { RadioButton };