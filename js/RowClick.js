import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

/**
 * RowClick settings object.
 *
 * ```
 * defaults = {
 *   childSelector: ':scope > :not([data-no-click])',
 *   href: undefined,
 *   target: '_self',
 *   modalTarget: undefined,
 *   formTarget: undefined
 * }
 * ```
 *
 * @typedef {Object} RowClickSettings
 * @prop {string} [childSelector] - Selector used to find child elements for initialization.
 * @prop {string} [href] - HREF for when you want to go to a new url.
 * @prop {string} [target] - Target for href allowing you to specify '_blank'.
 * @prop {string} [modalTarget] - Selector to open a modal.
 * @prop {string} [formTarget] - Selector to a form or submit button to submit a form.
 *
 * @see {@link https://stackoverflow.com/a/17206138/8316986|:scope pseudo-class stackoverflow}
 */

/**
 * Class to initialize elements that are not anchor or button elements with click events. Specifically table rows.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/row-click.html|Row Click Docs}
 */
class RowClick {
  /**
   * The default settings for a RowClick.
   * @type {RowClickSettings}
   */
  static #defaultSettings = {
    childSelector: ':scope > :not([data-no-click])',
    href: undefined,
    target: '_self',
    modalTarget: undefined,
    formTarget: undefined
  };

  /**
   * All the initialized HTMLElements and their RowClick objects.
   * @type {Map<HTMLElement, RowClick>}
   */
  static #initializedEls = new Map();

  /**
   * The root HTML element associated with this row click.
   * @type {HTMLElement}
   */
  #rowEl;

  /**
   * The list of children elements selected using the childSelector from settings.
   * @type {Array.<HTMLElement>}
   */
  #childEls;

  /**
   * Settings for the row click.
   * @type {RowClickSettings}
   */
  #settings;

  /**
   * A map of the element and an object of the stuff needed to destroy this RowClick object.
   * @type {Map<HTMLElement, {cursor: string, listener: () => void}>}
   */
  #childInitObjects = new Map();

  /**
   * Constructs a new RowClick object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {RowClickSettings} [options] - A RowClickSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/row-click.html|Row Click Docs}
   */
  constructor(el, options) {
    this.#rowEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (RowClick.#initializedEls.has(this.#rowEl)) {
      RowClick.#initializedEls.get(this.#rowEl).destroy();
    }

    this.#settings = Object.assign({}, RowClick.#defaultSettings, options, this.#rowEl.dataset);
    this.#childEls = [...this.#rowEl.querySelectorAll(this.#settings.childSelector)];

    for (const childEl of this.#childEls) {
      const temp = {
        cursor: childEl.style.cursor,
        listener: () => this.#onClick()
      };

      this.#childInitObjects.set(childEl, temp);
      childEl.style.cursor = 'pointer';
      childEl.addEventListener('click', temp.listener);
    }

    RowClick.#initializedEls.set(this.#rowEl, this);
  }

  /**
   * Destroys all events and resets DOM elements for this instance of RowClick.
   */
  destroy() {
    this.#childEls.forEach(c => {
      c.style.cursor = this.#childInitObjects.get(c).cursor;
      c.removeEventListener('click', this.#childInitObjects.get(c).listener);
    });
    RowClick.#initializedEls.delete(this.#rowEl);
  }

  #onClick() {
    if (this.#settings.href) {
      window.open(this.#settings.href, this.#settings.target);
    }
    else if (this.#settings.modalTarget) {
      this.#showModal();
    }
    else if (this.#settings.formTarget) {
      this.#submitForm();
    }
    else {
      throw new Error('Missing or unsupported settings for row.');
    }
  }

  #showModal() {
    const modalEl = document.querySelector(this.#settings.modalTarget);

    if (modalEl.matches('.modal')) {
      Modal.getOrCreateInstance(modalEl).show(this.#rowEl);
    }
    else {
      throw new Error('RowClick modal target is not a modal.');
    }
  }

  #submitForm() {
    const el = document.querySelector(this.#settings.formTarget);

    if (el && el.matches('form')) {
      el.requestSubmit();
    }
    else if (el && el.matches('[type="submit"]')) {
      (el.form || el.closest('form')).requestSubmit(el);
    }
    else {
      throw new Error('RowClick form target is not a form or submit button.');
    }
  }

  /**
   * A shortcut to do a mass initialization of any element that needs to be initialized.
   *
   * @param {string} [selector = '[data-isp-toggle="row-click"]'] - Selector used to find all elements to initialize.
   * @param {RowClickSettings} [options] - RowClickSettings object to use with each initialization.
   *
   * @returns {RowClick[]} - The array of RowClick objects that were initialized.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/row-click.html|Row Click Docs}
   */
  static initAll(selector = '[data-isp-toggle="row-click"]', options) {
    const els = document.querySelectorAll(selector);
    return [...els].map(el => new RowClick(el, options));
  }
}

export { RowClick };