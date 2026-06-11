/**
 * PasswordToggle settings object to configure a new PasswordToggle object.
 *
 * ```
 * defaults = {
 *   showIcon: 'fa-solid fa-eye',
 *   hideIcon: 'fa-solid fa-eye-slash',
 *   toggleBtn: 'btn btn-outline-secondary'
 * }
 * ```
 *
 * @typedef {Object} PasswordToggleSettings
 * @prop {string} showIcon - CSS classes to add to the toggle button icon when the input is hidden (and clicking will show it).
 * @prop {string} hideIcon - CSS classes to add to the toggle button icon when the input is visible (and clicking will hide it).
 * @prop {string} toggleBtn - CSS classes to add to the toggle button itself.
 */

/**
 * Decorate a text or password input element with a show/hide toggle button.
 */
class PasswordToggle {

  /**
   * The default settings for a PasswordToggle.
   * @type {PasswordToggleSettings}
   */
  static #defaultSettings = {
    showIcon: 'fa-solid fa-eye',
    hideIcon: 'fa-solid fa-eye-slash',
    toggleBtn: 'btn btn-outline-secondary'
  };

  /**
   * All the initialized HTMLElements and their PasswordToggle objects.
   * @type {Map<HTMLElement, PasswordToggle>}
   */
  static #initializedEls = new Map();

  /** @type {HTMLInputElement} */
  #input;

  #wrapper;
  #button;
  #icon;

  #originalParent;
  #originalNextSibling;

  /**
   * @type {PasswordToggleSettings}
   */
  #settings;

  /**
   * @param {string | HTMLInputElement} el - A string selector or an input element.
   * @param {PasswordToggleSettings} [options]
   */
  constructor(el, options = {}) {
    this.#input = typeof el === 'string' ? document.querySelector(el) : el;

    if (!(this.#input instanceof HTMLInputElement)) {
      throw new Error('PasswordToggle requires an HTMLInputElement');
    }

    if (PasswordToggle.#initializedEls.has(this.#input)) {
      PasswordToggle.#initializedEls.get(this.#input).destroy();
    }

    this.#settings = Object.assign({}, PasswordToggle.#defaultSettings, options, this.#parseDatasetOptions());
    this.#originalParent = this.#input.parentNode;
    this.#originalNextSibling = this.#input.nextSibling;
    this.#render();

    PasswordToggle.#initializedEls.set(this.#input, this);
  }

  #parseDatasetOptions() {
    const { showIcon, hideIcon, toggleBtn } = this.#input.dataset;
    return {
      ...(showIcon && { showIcon }),
      ...(hideIcon && { hideIcon }),
      ...(toggleBtn && { toggleBtn })
    };
  }

  #render() {
    this.#wrapper = document.createElement('div');
    this.#wrapper.className = 'input-group';

    this.#button =  document.createElement('button');
    this.#button.type = 'button';
    this.#button.className = this.#settings.toggleBtn;

    this.#icon = document.createElement('i');
    this.#button.append(this.#icon);
    this.#button.addEventListener('click', () => this.toggle());

    this.#wrapper.append(this.#input);
    this.#wrapper.append(this.#button);
    this.#originalParent.insertBefore(this.#wrapper, this.#originalNextSibling);
    this.#updateUi();
  }

  /**
   * Toggle the visibility of the input value.
   */
  toggle() {
    this.#input.type = this.#input.type === 'text' ? 'password' : 'text';
    this.#updateUi();
  }

  #updateUi() {
    const visible = this.#input.type === 'text';
    this.#setVisibilityIcon(visible);
  }

  #setVisibilityIcon(visible) {
    this.#icon.className = visible ? this.#settings.hideIcon : this.#settings.showIcon;
    this.#button.title = visible ? 'Hide' : 'Show';
    this.#button.setAttribute('aria-label', visible ? 'Hide input content' : 'Show input content');
  }

  /**
   * Remove the toggle button and restore the original DOM structure.
   */
  destroy() {
    this.#originalParent.insertBefore(this.#input, this.#originalNextSibling);
    if (this.#wrapper != null) {
      this.#wrapper.remove();
    }
    this.#wrapper = null;
    PasswordToggle.#initializedEls.delete(this.#input);
  }
}

export { PasswordToggle };