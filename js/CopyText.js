import { Toast } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

class CopyText {
  static #defaultSelector = '[data-isp-toggle="copy-text"]'

  static #defaultSettings = {
    copyTrigger: 'click',
    copyElProperty: 'textContent',
    copyToastText: 'Copied to clipboard',
    copyToast: '#copyTextToast',
  }

  static #initializedEls = new Map();

  #copyHandler;

  /**
   * The root HTML element associated with the copy text functionality
   * @type {HTMLElement}
   */
  el;

  /**
   * Settings for copy functionality.
   * @typedef {Object} CopyTextSettings
   * @property {string} [copyTrigger] - (Optional) The event to trigger the copy operation. Defaults to click.
   * @property {string} [copyText] - Text to copy to clipboard.
   * @property {selector} [copyTarget] - Selector of element whose text content to copy to clipboard.
   * @property {string} [copyElProperty] - (Optional) The element property used to extract text from the copyTarget. Defaults to textContent.
   * @property {selector} [copyToastText] - Success toast text. Defaults to 'Copied to clipboard.'
   * @property {selector} [copyToast] - Selector of Bootstrap 5 toast to show on success. Defaults to '#copyTextToast' but a temporary toast will be created if the selector is not found.
   */
  settings;

  /**
   * @param {selector | HTMLTableRowElement} el - A selector or element
   * @param {CopyTextSettings} options - (Optional) A CopyTextSettings object
   */
  constructor(el, options) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;

    if (CopyText.#initializedEls.has(this.el)) {
      CopyText.#initializedEls.get(this.el).destroy();
    }

    this.settings = Object.assign({}, CopyText.#defaultSettings, options, this.el.dataset);

    this.#copyHandler = (e) => this.#doCopy(e);
    this.el.addEventListener(this.settings.copyTrigger, this.#copyHandler);
    CopyText.#initializedEls.set(this.el, this);
  }

  destroy() {
    this.el.removeEventListener(this.settings.copyTrigger, this.#copyHandler);
    CopyText.#initializedEls.delete(this.el);
  }

  static initAll(selector, options) {
    const els = document.querySelectorAll(selector || CopyText.#defaultSelector);
    return [...els].map(el => new CopyText(el, options));
  }

  async #doCopy() {
    let textToCopy = this.settings.copyText;

    if (this.settings.copyTarget) {
      textToCopy = CopyText.#extractText(this.settings.copyTarget, this.settings.copyElProperty);
    }

    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      CopyText.#showToast(this.settings.copyToast, this.settings.copyToastText);
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
          <div class="toast text-bg-success-subtle" role="alert">
            <div class="toast-body">${defaultToastText}</div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', toastMarkup);
      toastEl = document.querySelector('[data-temp-toast] .toast');
    }

    if (!toastEl.classList.contains('toast')) {
      toastEl = toastEl.querySelector('.toast');
    }

    const toast = new Toast(toastEl, {delay: 2000});
    toast.show();

    if (temporary) {
      toastEl.addEventListener('hidden.bs.toast', () => {
        const container = toastEl.closest('[data-temp-toast]');
        container?.remove();
      }, {once: true});
    }
  }
}

export { CopyText }