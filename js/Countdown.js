/**
 * Countdown settings object to configure a new Countdown object.
 *
 * ```
 * defaults = {
 *   maxLength: 255,
 *   label: 'Characters remaining: ',
 *   labelClass: 'form-text',
 *   showAll: false
 * }
 * ```
 *
 * @typedef {Object} CountdownSettings
 * @prop {number} [maxLength] - Max length of the input string.
 * @prop {string} [label] - The label text of the countdown.
 * @prop {string} [labelClass] - The CSS class used for the label.
 * @prop {boolean} [showAll] - When `true` runs function on input to resize the textarea to show all content.
 */

/**
 * Class to initialize character countdowns on `textarea` inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/countdown.html|Countdown Docs}
 */
class Countdown {
  /**
   * The default settings for a Countdown.
   * @type {CountdownSettings}
   */
  static #defaultSettings = {
    maxLength: 255,
    label: 'Characters remaining: ',
    labelClass: 'form-text',
    showAll: false
  };

  /**
   * All the initialized HTMLElements and their Countdown objects.
   * @type {Map<HTMLElement, Countdown>}
   */
  static #initializedEls = new Map();

  /**
   * The textarea this Countdown object is initialized on.
   * @type {HTMLTextAreaElement|HTMLInputElement}
   */
  #inputEl;

  /**
   * The label element with the label text and spanEl.
   * @type {HTMLElement}
   */
  #labelEl;

  /**
   * The span element with the actual count.
   * @type {HTMLElement}
   */
  #spanEl;

  /**
   * Settings for the countdown.
   * @type {CountdownSettings}
   */
  #settings;

  /**
   * The width of the border * 2. Used when calculating the height of the textarea.
   * @type {number}
   */
  #borderOffset;

  /**
   * The minimum height of a textarea. Used when calculating the height of the textarea.
   * @type {number}
   */
  #minHeight;

  /**
   * Reference to the function called on input so it can be removed.
   * @type {function}
   */
  #onInput;

  /**
   * Constructs a new Countdown object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {CountdownSettings} [options] - A CountdownSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/countdown.html|Countdown Docs}
   */
  constructor(el, options) {
    this.#inputEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (Countdown.#initializedEls.has(this.#inputEl)) {
      Countdown.#initializedEls.get(this.#inputEl).destroy();
    }

    this.#settings = Countdown.#getSettings(this.#inputEl, options);
    this.#labelEl = Countdown.#buildLabelEl(this.#inputEl, this.#settings);
    this.#spanEl = this.#labelEl.firstElementChild;
    this.#onInput = () => this.#setCount();

    if (this.#settings.showAll) {
      this.#borderOffset = parseFloat(window.getComputedStyle(this.#inputEl).borderWidth) * 2;
      this.#minHeight = this.#inputEl.clientHeight + this.#borderOffset;
    }

    this.#inputEl.maxLength = this.#settings.maxLength;
    this.#inputEl.addEventListener('input', this.#onInput);

    Countdown.#initializedEls.set(this.#inputEl, this);
    this.#inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * Removes event listeners and does general DOM cleanup to remove this Countdown object.
   */
  destroy() {
    this.#inputEl.removeEventListener('input', this.#onInput);
    this.#labelEl.remove();
    Countdown.#initializedEls.delete(this.#inputEl);
  }

  #setCount() {
    this.#spanEl.textContent = (this.#inputEl.maxLength - this.#inputEl.value.length).toString();

    if (this.#settings.showAll) {
      this.#inputEl.style.height = 'auto';

      const scrollHeight = this.#inputEl.scrollHeight + this.#borderOffset;
      const height = Math.max(scrollHeight, this.#minHeight);

      this.#inputEl.style.height = height + 'px';
    }
  }

  /**
   * A shortcut to do a mass initialization of any element that needs to be initialized.
   *
   * @param {string} [selector = '[data-isp-toggle="countdown"]'] - Selector used to find all elements to initialize.
   * @param {CountdownSettings} [options] - CountdownSettings object to use with each initialization.
   *
   * @returns {Countdown[]} - The array of Countdown objects that were initialized.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/countdown.html|Countdown Docs}
   */
  static initAll(selector = '[data-isp-toggle="countdown"]', options) {
    const els = document.querySelectorAll(selector);
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
    el.insertAdjacentHTML('afterend', `
      <div class="${settings.labelClass}">
        ${settings.label}<span>${settings.maxLength}</span>
      </div>
    `);
    return el.nextElementSibling;
  }
}

export { Countdown }