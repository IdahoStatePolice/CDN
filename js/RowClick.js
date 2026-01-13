import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

class RowClick {
  static #defaultSelector = '[data-isp-toggle="row-click"]';

  static #defaultSettings = {
    //https://stackoverflow.com/a/17206138/8316986
    childSelector: ':scope > :not([data-no-click])',
    href: null,
    target: '_self',
    modalTarget: null,
    formTarget: null
  };

  static #initializedEls = new Map();

  static #childCursors = new Map();

  /**
   * The root HTML element associated with this row click.
   * @type {HTMLElement}
   */
  rowEl;

  /**
   * The list of children selected using the childSelector from settings.
   * @type {Array.<HTMLElement>}
   */
  childEls;

  /**
   * Settings for the row click.
   * @typedef {Object} RowClickSettings
   * @property {string} [childSelector]
   * @property {url} [href] - href for when you want to go to a new url
   * @property {string} [target] - target for href allowing you to specify '_blank'
   * @property {string} [modalTarget] - selector to open a modal
   * @property {string} [formTarget] - selector to a form or submit button to submit a form
   */
  settings;

  /**
   * @param {string | HTMLTableRowElement} el - A selector or table row element
   * @param {RowClickSettings} options - (Optional) A RowClickSettings object
   */
  constructor(el, options) {
    this.rowEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (RowClick.#initializedEls.has(this.rowEl)) {
      RowClick.#initializedEls.get(this.rowEl).destroy();
    }

    this.settings = Object.assign({}, RowClick.#defaultSettings, options, this.rowEl.dataset);
    this.childEls = [...this.rowEl.querySelectorAll(this.settings.childSelector)];

    this.childEls.forEach(RowClick.#initializeChild);
    RowClick.#initializedEls.set(this.rowEl, this);
  }

  /**
   * Destroys all events and resets DOM elements for this instance of RowClick.
   */
  destroy() {
    this.childEls.forEach(c => {
      c.style.cursor = RowClick.#childCursors.get(c);
      RowClick.#childCursors.delete(c);
      c.removeEventListener('click', RowClick.#onChildClick);
    });
    RowClick.#initializedEls.delete(this.rowEl);
  }

  /**
   * Searches DOM and initializes all selected elements.
   * @param {selector} selector - (Optional) A selector for a .querySelectorAll method call.
   * @param {RowClickSettings} options - (Optional) A RowClickSettings object
   * @returns {RowClick[]}
   */
  static initAll(selector, options) {
    const els = document.querySelectorAll(selector || RowClick.#defaultSelector);
    return [...els].map(el => new RowClick(el, options));
  }

  static #initializeChild(childEl) {
    RowClick.#childCursors.set(childEl, childEl.style.cursor);
    childEl.style.cursor = 'pointer';
    childEl.addEventListener('click', RowClick.#onChildClick);
  }

  static #onChildClick(e) {
    const rowClick = getRowClickInstance(e.target);
    const settings = rowClick.settings;

    if (settings.href) {
      window.open(settings.href, settings.target)?.focus();
    }
    else if (settings.modalTarget) {
      const modalEl = document.querySelector(settings.modalTarget);
      if (modalEl.matches('.modal')) {
        Modal.getOrCreateInstance(modalEl).show(rowClick.rowEl);
      }
      else {
        throw new Error('RowClick modal target is not a modal.');
      }
    }
    else if (settings.formTarget) {
      const el = document.querySelector(settings.formTarget);
      if (el && el.matches('form')) {
        el.requestSubmit();
      }
      if (el && el.matches('button[type="submit"]')) {
        (el.form || el.closest('form')).requestSubmit(el);
      }
      else {
        throw new Error('RowClick form target is not a form or submit button.');
      }
    }
    else {
      throw new Error('Missing or unsupported settings for row.');
    }

    function getRowClickInstance(el) {
      let parent = el;

      while (parent && !RowClick.#initializedEls.has(parent)) {
        parent = parent.parentElement;
      }

      if (parent) {
        return RowClick.#initializedEls.get(parent);
      }

      throw new Error('Could not find RowClick settings for child: ' + el);
    }
  }
}

export { RowClick };