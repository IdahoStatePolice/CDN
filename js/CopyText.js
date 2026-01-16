import { Toast } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

/**
 * CopyText settings object to configure a new CopyText object.
 *
 * ```
 * defaults = {
 *   copyText: undefined,
 *   copyTarget: undefined,
 *   copyTrigger: 'click',
 *   copyElProperty: 'textContent',
 *   copyToastText: 'Copied to clipboard',
 *   copyToast: '#copyTextToast',
 * }
 * ```
 *
 * @typedef {Object} CopyTextSettings
 * @prop {string} copyText - Text to copy to clipboard.
 * @prop {string} copyTarget - Selector of element whose text content to copy to clipboard.
 * @prop {string} [copyTrigger] - The event to trigger the copy operation. Defaults to click.
 * @prop {string} [copyElProperty] - The element property used to extract text from the copyTarget. Defaults to textContent.
 * @prop {string} [copyToastText] - Success toast text. Defaults to 'Copied to clipboard.'
 * @prop {string} [copyToast] - Selector of Bootstrap 5 toast to show on success. Defaults to '#copyTextToast' but a temporary toast will be created if the selector is not found.
 */

/**
 * Class to initialize copy to clipboard functions.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/copy-text.html|Copy Text Docs}
 */
class CopyText {
  /**
   * The default settings for a CopyText.
   * @type {CopyTextSettings}
   */
  static #defaultSettings = {
    copyText: undefined,
    copyTarget: undefined,
    copyTrigger: 'click',
    copyElProperty: 'textContent',
    copyToastText: 'Copied to clipboard',
    copyToast: '#copyTextToast'
  };

  /**
   * All the initialized HTMLElements and their CopyText objects.
   * @type {Map<HTMLElement, CopyText>}
   */
  static #initializedEls = new Map();

  /**
   * The root HTML element associated with the copy text functionality
   * @type {HTMLElement}
   */
  #el;

  /**
   * Settings for the copy text.
   * @type {CopyTextSettings}
   */
  #settings;

  /**
   * Event handler reference used to deregister event listener on destroy.
   * @type {function}
   */
  #copyHandler;

  /**
   * Constructs a new CopyText object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {CopyTextSettings} [options] - A CopyTextSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/copy-text.html|Copy Text Docs}
   */
  constructor(el, options) {
    this.#el = typeof el === 'string' ? document.querySelector(el) : el;

    if (CopyText.#initializedEls.has(this.#el)) {
      CopyText.#initializedEls.get(this.#el).destroy();
    }

    this.#settings = Object.assign({}, CopyText.#defaultSettings, options, this.#el.dataset);
    this.#copyHandler = () => this.#doCopy();

    this.#el.addEventListener(this.#settings.copyTrigger, this.#copyHandler);
    CopyText.#initializedEls.set(this.#el, this);
  }

  /**
   * Removes event listeners and does general DOM cleanup to remove this CopyText object.
   */
  destroy() {
    this.#el.removeEventListener(this.#settings.copyTrigger, this.#copyHandler);
    CopyText.#initializedEls.delete(this.#el);
  }

  /**
   * A shortcut to do a mass initialization of any element that needs to be initialized.
   *
   * @param {string} [selector = '[data-isp-toggle="copy-text"]'] - Selector used to find all elements to initialize.
   * @param {CopyTextSettings} [options] - CopyTextSettings object to use with each initialization.
   *
   * @returns {CopyText[]} - The array of CopyText objects that were initialized.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/copy-text.html|Copy Text Docs}
   */
  static initAll(selector = '[data-isp-toggle="copy-text"]', options) {
    const els = document.querySelectorAll(selector);
    return [...els].map(el => new CopyText(el, options));
  }

  async #doCopy() {
    let textToCopy = this.#settings.copyText;

    if (this.#settings.copyTarget) {
      textToCopy = CopyText.#extractText(this.#settings.copyTarget, this.#settings.copyElProperty);
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      CopyText.#showToast(this.#settings.copyToast, this.#settings.copyToastText);
    }
  }

  static #extractText(selector, elProperty) {
    const targets = document.querySelectorAll(selector);
    if (targets.length === 0) {
      console.warn(`No elements found for selector: ${selector}`);
      return null;
    }

    const extractedText = Array.from(targets).map(el => {
      if (el.value != null) {
        return el.value;
      }

      let text = '';
      if (elProperty in el) {
        text = el[elProperty];
      }
      else {
        console.warn(`Unknown element property: ${elProperty}`);
      }

      return (text ?? '').replace(/\s+/g, ' ').trim();
    }).join(' ');

    if (!extractedText) {
      console.warn(`No text found in copy target(s): ${selector}`);
      return null;
    }

    return extractedText;
  }

  static #showToast(toastSelector, defaultToastText) {
    let toastEl = document.querySelector(toastSelector);
    let temporary = false;

    if (!toastEl) {
      temporary = true;
      const toastMarkup = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3" data-temp-toast>
          <div class="toast border-success text-success-emphasis bg-success-subtle" role="alert">
            <div class="toast-body">${defaultToastText}</div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', toastMarkup);
      toastEl = document.querySelector('[data-temp-toast] .toast');
    }

    if (!toastEl.classList.contains('toast')) {
      toastEl = toastEl.querySelector('.toast');
    }

    const toast = new Toast(toastEl, { delay: 2000 });
    toast.show();

    if (temporary) {
      toastEl.addEventListener('hidden.bs.toast', () => {
        const container = toastEl.closest('[data-temp-toast]');
        container?.remove();
      }, { once: true });
    }
  }
}

export { CopyText }