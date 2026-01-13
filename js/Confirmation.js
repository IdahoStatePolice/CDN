import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

class Confirmation {
  static #defaultSelector = '[data-isp-toggle="confirmation"]'

  static #defaultSettings = {
    title: 'Are you sure?',
    body: 'This action may be irreversible.<br><br><b>Are you sure you would like to continue?</b>',
    yesLabel: 'Yes',
    yesClass: 'btn-primary',
    noLabel: 'No',
    noClass: 'btn-secondary',
    hideX: false,
    static: false,
    yesCallback: undefined,
    noCallback: undefined,
  }

  static #initializedEls = new Map();
  static #inProgressEls = new Set();

  /**
   * The root HTML element associated with this confirmation.
   * @type {HTMLElement}
   */
  el;

  /**
   * @typedef {Object} ConfirmationSettings
   * @property {string} [eventType]
   * @property {string} [title]
   * @property {string} [body]
   * @property {string} [yesLabel]
   * @property {string} [yesClass]
   * @property {string} [noLabel]
   * @property {string} [noClass]
   * @property {boolean} [hideX]
   * @property {boolean} [static]
   * @property {(el: HTMLElement, modal: Modal) => void} [yesCallback]
   * @property {(el: HTMLElement, modal: Modal) => void} [noCallback]
   */

  /**
   * Settings for the confirmation.
   * @type {ConfirmationSettings}
   */
  settings;

  // private eventHandler reference used to deregister event listener on destroy
  #eventHandler;

  /**
   * @param {string | HTMLElement} el - A string or a DOM element
   * @param {ConfirmationSettings} [options] - Optional options object
   */
  constructor(el, options) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;

    if (Confirmation.#initializedEls.has(this.el)) {
      Confirmation.#initializedEls.get(this.el).destroy();
    }

    this.settings = this.settings = {
      ...Confirmation.#defaultSettings,
      eventType: this.el instanceof HTMLFormElement ? 'submit' : 'click',
      ...options,
      ...this.el.dataset
    };

    this.#eventHandler = e => {
      if (Confirmation.#inProgressEls.has(this.el)) {
        return;
      }

      e.preventDefault();

      if (Confirmation.#isAnchorOrBtn(this.el) || Confirmation.#isForm(this.el)) {
        e.stopImmediatePropagation();
      }

      this.#showConfirmation();
    }

    this.el.addEventListener(this.settings.eventType, this.#eventHandler);
    Confirmation.#initializedEls.set(this.el, this);
  }

  destroy() {
    this.el.removeEventListener(this.settings.eventType, this.#eventHandler);
    Confirmation.#initializedEls.delete(this.el);
    Confirmation.#inProgressEls.delete(this.el);
  }

  static initAll(selector, options) {
    const els = document.querySelectorAll(selector || Confirmation.#defaultSelector);
    return [...els].map(el => new Confirmation(el, options));
  }

  #showConfirmation() {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" tabindex="-1"${this.settings.static ? ' data-bs-backdrop="static" data-bs-keyboard="false"' : ''}>
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${this.settings.title}</h5>
              ${this.settings.hideX ? '' : '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'}
            </div>
            <div class="modal-body">
              <p class="mb-0">${this.settings.body}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn ${this.settings.noClass}" data-confirm-no>${this.settings.noLabel}</button>
              <button type="button" class="btn ${this.settings.yesClass}" data-confirm-yes>${this.settings.yesLabel}</button>
            </div>
          </div>
        </div>
      </div>
    `);

    const modalEl = document.body.lastElementChild;
    const modal = new Modal(modalEl);

    modalEl.querySelector('[data-confirm-yes]').addEventListener('click', () => Confirmation.#yesClickHandler(modal, this.el, this.settings.yesCallback));
    modalEl.querySelector('[data-confirm-no]').addEventListener('click', () => Confirmation.#noClickHandler(modal, this.el, this.settings.noCallback));

    modalEl.addEventListener('show.bs.modal', () => this.el.dispatchEvent(new Event('isp.confirmation:show', {bubbles: true})));
    modalEl.addEventListener('shown.bs.modal', () => this.el.dispatchEvent(new Event('isp.confirmation:shown', {bubbles: true})));
    modalEl.addEventListener('hide.bs.modal', () => this.el.dispatchEvent(new Event('isp.confirmation:hide', {bubbles: true})));
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
      this.el.dispatchEvent(new Event('isp.confirmation:hidden', {bubbles: true}));
    });
    modalEl.addEventListener('hidePrevented.bs.modal', () => this.el.dispatchEvent(new Event('isp.confirmation:hidePrevented', {bubbles: true})));

    modal.show();
  }

  static #yesClickHandler(modal, el, yesCallback) {
    Confirmation.#inProgressEls.add(el);

    if (yesCallback) {
      Confirmation.#executeCallback(el, modal, yesCallback);
    }
    else {
      if (Confirmation.#isAnchorOrBtn(el)) {
        el.click();
      }
      if (Confirmation.#isForm(el)) {
        el.requestSubmit();
      }
      if (Confirmation.#isSubmitBtnOrInput(el)) {
        (el.form || el.closest('form')).requestSubmit(el);
      }
      modal.hide();
    }

    Confirmation.#inProgressEls.delete(el);
  }

  static #noClickHandler(modal, el, noCallback) {
    if (noCallback) {
      Confirmation.#executeCallback(el, modal, noCallback);
    }
    else {
      modal.hide();
    }
  }

  static #executeCallback(el, modal, callback) {
    if (typeof callback === 'string') {
      if (window[callback] instanceof Function) {
        return window[callback](el, modal);
      }
      return new Function(callback)(el, modal);
    }
    else if (callback instanceof Function) {
      return callback(el, modal);
    }
    else {
      throw new Error('Callback function ' + callback + ' is not valid.');
    }
  }

  static #isAnchorOrBtn(el) {
    return el instanceof HTMLAnchorElement || (el instanceof HTMLButtonElement && el.type === 'button');
  }

  static #isForm(el) {
    return el instanceof HTMLFormElement;
  }

  static #isSubmitBtnOrInput(el) {
    return (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) && el.type === 'submit';
  }
}

export { Confirmation };