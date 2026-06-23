import { resolveSettings } from "./utils.js";

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
 * Class to initialize elements that are not anchor or button elements with click events.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/row-click.html|Row Click Docs}
 */
class RowClick {
  /**
   * The default settings for a RowClick.
   * @type {RowClickSettings}
   */
  static #DEFAULTS = Object.freeze({
    childSelector: ':scope > :not([data-no-click])',
    href: undefined,
    target: '_self',
    modalTarget: undefined,
    formTarget: undefined
  });

  /**
   * All the initialized HTMLElements and their RowClick objects.
   * @type {WeakMap<HTMLElement, RowClick>}
   */
  static #INSTANCES = new WeakMap();


  /**
   * The root HTML element associated with this row click.
   * @type {HTMLElement}
   */
  #rowEl;

  /**
   * The Bootstrap Modal class to use for opening modals.
   * @type {typeof import('bootstrap').Modal | undefined}
   */
  #modalClass;

  /**
   * The list of children elements selected using the childSelector from settings.
   * @type {Array.<HTMLElement>}
   */
  #childEls;

  /**
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
   * @param [ModalClass] - Bootstrap Modal class to use for opening modals.
   * @param {RowClickSettings} [options] - A RowClickSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/row-click.html|Row Click Docs}
   */
  constructor(el, ModalClass = undefined, options) {
    this.#rowEl = typeof el === 'string' ? document.querySelector(el) : el;
    this.#modalClass = ModalClass;

    if (RowClick.#INSTANCES.has(this.#rowEl)) {
      RowClick.#INSTANCES.get(this.#rowEl).destroy();
    }

    this.#settings = resolveSettings(RowClick.#DEFAULTS, options, this.#rowEl);
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

    RowClick.#INSTANCES.set(this.#rowEl, this);
  }

  /**
   * Destroys all events and resets DOM elements for this instance of RowClick.
   */
  destroy() {
    this.#childEls.forEach(c => {
      c.style.cursor = this.#childInitObjects.get(c).cursor;
      c.removeEventListener('click', this.#childInitObjects.get(c).listener);
    });
    RowClick.#INSTANCES.delete(this.#rowEl);
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
      this.#modalClass.getOrCreateInstance(modalEl).show(this.#rowEl);
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
}

export { RowClick };