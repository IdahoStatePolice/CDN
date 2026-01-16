import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

/**
 * Confirmation settings object to configure a new Confirmation object.
 *
 * ```
 * defaults = {
 *   title: 'Are you sure?',
 *   body: 'This action may be irreversible.<br><br><b>Are you sure you would like to continue?</b>',
 *   yesLabel: 'Yes',
 *   yesClass: 'btn-primary',
 *   noLabel: 'No',
 *   noClass: 'btn-secondary',
 *   hideX: false,
 *   static: false,
 *   yesCallback: undefined,
 *   noCallback: undefined,
 * }
 * ```
 *
 * @typedef {Object} ConfirmationSettings
 * @prop {string} [title] - The title of the confirmation modal.
 * @prop {string} [body] - The text in the body of the confirmation modal.
 * @prop {string} [yesLabel] - The text on the 'yes' button of the confirmation modal.
 * @prop {string} [yesClass] - The Bootstrap button color CSS class used on the 'yes' button.
 * @prop {string} [noLabel] - The text on the 'no' button of the confirmation modal.
 * @prop {string} [noClass] - The Bootstrap button color CSS class used on the 'no' button.
 * @prop {boolean} [hideX] - If `true` will hide the x button in the upper right side of the confirmation modal.
 * @prop {boolean} [static] - If `true` will add the attributes `data-bs-backdrop="static"` and  `data-bs-keyboard="false"`
 * to the confirmation modal preventing it from being closed for any other reason that clicking on one of the buttons in the modal.
 * @prop {(el: HTMLElement, modal: Modal) => void} [yesCallback] - A callback function to execute if the user selects the 'yes' option.
 * The first parameter is the HTML element that triggered this confirmation.
 * The second parameter is the Bootstrap `Modal` object that represents this confirmation dialog.
 * @prop {(el: HTMLElement, modal: Modal) => void} [noCallback] - A callback function to execute if the user selects the 'no' option.
 * The first parameter is the HTML element that triggered this confirmation.
 * The second parameter is the Bootstrap `Modal` object that represents this confirmation dialog.
 */

/**
 * Class to initialize confirmation dialogs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/confirmation.html|Confirmation Docs}
 */
class Confirmation {
  /**
   * The default settings for a Confirmation.
   * @type {ConfirmationSettings}
   */
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
  };

  /**
   * All the initialized HTMLElements and their Confirmation objects.
   * @type {Map<HTMLElement, Confirmation>}
   */
  static #initializedEls = new Map();

  /**
   * The root HTML element associated with this confirmation.
   * @type {HTMLFormElement | HTMLButtonElement | HTMLInputElement | HTMLAnchorElement | HTMLElement}
   */
  #el;

  /**
   * Settings for the confirmation.
   * @type {ConfirmationSettings}
   */
  #settings;

  /**
   * Event type used to add and remove the event listener.
   * @type {string}
   */
  #eventType;

  /**
   * Event handler reference used to deregister event listener on destroy.
   * @type {function}
   */
  #eventHandler;

  /**
   * Boolean flag used to prevent double clicks on the yes button.
   * @type {boolean}
   */
  #inProgress = false;

  /**
   * Constructs a new Confirmation object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {ConfirmationSettings} [options] - A ConfirmationSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/confirmation.html|Confirmation Docs}
   */
  constructor(el, options) {
    this.#el = typeof el === 'string' ? document.querySelector(el) : el;

    if (Confirmation.#initializedEls.has(this.#el)) {
      Confirmation.#initializedEls.get(this.#el).destroy();
    }

    this.#settings = {
      ...Confirmation.#defaultSettings,
      ...options,
      ...this.#el.dataset
    };

    this.#eventType = this.#el instanceof HTMLFormElement ? 'submit' : 'click';

    this.#eventHandler = e => {
      if (this.#inProgress) {
        return;
      }

      e.preventDefault();

      if (Confirmation.#isAnchorOrBtn(this.#el) || Confirmation.#isForm(this.#el)) {
        e.stopImmediatePropagation();
      }

      this.#showConfirmation();
    }

    this.#el.addEventListener(this.#eventType, this.#eventHandler);
    Confirmation.#initializedEls.set(this.#el, this);
  }

  /**
   * Removes event listeners and does general DOM cleanup to remove this Confirmation object.
   */
  destroy() {
    this.#el.removeEventListener(this.#eventType, this.#eventHandler);
    Confirmation.#initializedEls.delete(this.#el);
  }

  /**
   * A shortcut to do a mass initialization of any element that needs to be initialized.
   *
   * @param {string} [selector = '[data-isp-toggle="confirmation"]'] - Selector used to find all elements to initialize.
   * @param {ConfirmationSettings} [options] - ConfirmationSettings object to use with each initialization.
   *
   * @returns {Confirmation[]} - The array of Confirmation objects that were initialized.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/confirmation.html|Confirmation Docs}
   */
  static initAll(selector = '[data-isp-toggle="confirmation"]', options) {
    const els = document.querySelectorAll(selector);
    return [...els].map(el => new Confirmation(el, options));
  }

  #showConfirmation() {
    document.body.insertAdjacentHTML('beforeend', Confirmation.#modalHtml(this.#settings));
    const modalEl = document.body.lastElementChild;
    const modal = new Modal(modalEl);

    modalEl.querySelector('[data-confirm-yes]').addEventListener('click', () => this.#yesClickHandler(modal));
    modalEl.querySelector('[data-confirm-no]').addEventListener('click', () => this.#noClickHandler(modal));

    modalEl.addEventListener('show.bs.modal', () => this.#el.dispatchEvent(new Event('isp.confirmation:show', { bubbles: true })));
    modalEl.addEventListener('shown.bs.modal', () => this.#el.dispatchEvent(new Event('isp.confirmation:shown', { bubbles: true })));
    modalEl.addEventListener('hide.bs.modal', () => this.#el.dispatchEvent(new Event('isp.confirmation:hide', { bubbles: true })));
    modalEl.addEventListener('hidden.bs.modal', () => {
      modalEl.remove();
      this.#el.dispatchEvent(new Event('isp.confirmation:hidden', { bubbles: true }));
    });
    modalEl.addEventListener('hidePrevented.bs.modal', () => this.#el.dispatchEvent(new Event('isp.confirmation:hidePrevented', { bubbles: true })));

    modal.show();
  }

  #yesClickHandler(modal) {
    this.#inProgress = true;

    if (this.#settings.yesCallback) {
      this.#executeCallback(modal, this.#settings.yesCallback);
    }
    else {
      if (Confirmation.#isAnchorOrBtn(this.#el)) {
        this.#el.click();
      }
      if (Confirmation.#isForm(this.#el)) {
        this.#el.requestSubmit();
      }
      if (Confirmation.#isSubmitBtnOrInput(this.#el)) {
        (this.#el.form || this.#el.closest('form')).requestSubmit(this.#el);
      }
      modal.hide();
    }

    this.#inProgress = false;
  }

  #noClickHandler(modal) {
    if (this.#settings.noCallback) {
      this.#executeCallback(modal, this.#settings.noCallback);
    }
    else {
      modal.hide();
    }
  }

  #executeCallback(modal, callback) {
    if (typeof callback === 'string') {
      if (window[callback] instanceof Function) {
        return window[callback](this.#el, modal);
      }
      return new Function(callback)(this.#el, modal);
    }
    else if (callback instanceof Function) {
      return callback(this.#el, modal);
    }
    else {
      throw new Error('Callback function ' + callback + ' is not valid.');
    }
  }

  static #modalHtml(settings) {
    const staticAttributes = settings.static ? ' data-bs-backdrop="static" data-bs-keyboard="false"' : '';
    const headerXBtn = settings.hideX ? '' : '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
    return `
      <div class="modal fade" tabindex="-1"${staticAttributes}>
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${settings.title}</h5>
              ${headerXBtn}
            </div>
            <div class="modal-body">
              ${settings.body}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn ${settings.noClass}" data-confirm-no>${settings.noLabel}</button>
              <button type="button" class="btn ${settings.yesClass}" data-confirm-yes>${settings.yesLabel}</button>
            </div>
          </div>
        </div>
      </div>
    `;
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