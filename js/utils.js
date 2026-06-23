const modalListener = (e) => {
  const els = e.target.querySelectorAll('[autofocus]');
  [...els].filter(el => el.checkVisibility())?.[0]?.focus();
}

const collapseListener = (e) => {
  const inputs = e.target.querySelectorAll('[autofocus]');
  [...inputs].filter(e => e.checkVisibility())?.[0]?.focus();
}

const preventNav = (e) => {
  e.preventDefault();
  e.returnValue = 'Any changes made will be lost. Are you sure?';
  return 'Any changes made will be lost. Are you sure?';
}

const dirtyChangeListener = () => {
  window.removeEventListener('beforeunload', preventNav);
  window.addEventListener('beforeunload', preventNav);
};

const dirtySubmitListener = () => window.removeEventListener('beforeunload', preventNav);

/**
 * @returns {string} the current server context.
 */
function getContext() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1));
}

/**
 * Calls the initializer callback for each element matching the CSS selector.
 * Optionally registers a MutationObserver to automatically initialize matching
 * elements added to the DOM after the initial call.
 *
 * @param {string} selector - CSS selector identifying target elements.
 * @param {Function} initializer - Function to run on each matched element.
 * @param {boolean} [registerMutationObserver=true] - When true, observes the DOM
 *   for dynamically added elements matching the selector and runs the initializer
 *   on them automatically. Disable if the component is initialized in a context
 *   where DOM observation is unnecessary or unwanted (e.g., one-time static render).
 *
 * @returns {MutationObserver|undefined} The observer instance, if one was registered.
 *   On single-page apps, call .disconnect() to stop observing when the component is removed.
 */
function initAll(selector, initializer, registerMutationObserver = true) {
  document.querySelectorAll(selector).forEach(el => initializer(el));

  if (registerMutationObserver) {
    const mutationCallback = (records) => {
      const nodes = records.flatMap(r => [...r.addedNodes]);
      for (const nodeEl of nodes.filter(n => n instanceof Element)) {
        if (nodeEl.matches(selector)) {
          initializer(nodeEl);
        }
        nodeEl.querySelectorAll(selector).forEach(el => initializer(el));
      }
    };

    const observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, { subtree: true, childList: true });
    return observer;
  }
}

/**
 * Finds the first visible element with the autofocus attribute in the modal and puts focus on it when shown.
 */
function initModalAutofocus() {
  document.removeEventListener('shown.bs.modal', modalListener);
  document.addEventListener('shown.bs.modal', modalListener);
}

/**
 * Finds the first visible element with the autofocus attribute in the collapse and puts focus on it when shown.
 */
function initCollapseAutoFocus() {
  document.removeEventListener('shown.bs.collapse', collapseListener);
  document.addEventListener('shown.bs.collapse', collapseListener);
}

/**
 * When this function is executed, it will find modals with the `modalSelector`
 * and then look for the existence of elements inside that modal based on the
 * `errorSelector`. If there are matching elements, then the modal is shown.
 *
 * @param {import('https://cdn.jsdelivr.net/npm/bootstrap@latest/+esm').Modal} modalClass - Bootstrap 5 Modal class.
 * @param {string} [modalSelector = '.modal'] - The selector used to decide which modals to search.
 * @param {string} [errorSelector = '.is-invalid, .alert.alert-danger'] - The selector used to check if an error exists inside the modal.
 */
function initModalShowOnError(modalClass, modalSelector = '.modal', errorSelector = '.is-invalid, .alert.alert-danger') {
  for (const modalEl of document.querySelectorAll(modalSelector)) {
    const invalidEl = modalEl.querySelector(errorSelector);

    if (invalidEl && modalEl.parentElement.checkVisibility()) {
      modalClass.getOrCreateInstance(modalEl).show();
      setTimeout(() => invalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 355);
    }
  }
}

/**
 * This function initializes a collection of event listeners based on
 * the `beforeunload` event to prevent users from leaving the page.
 */
function dirtyCheck() {
  document.removeEventListener('change', dirtyChangeListener);
  document.removeEventListener('submit', dirtySubmitListener);

  document.addEventListener('change', dirtyChangeListener);
  document.addEventListener('submit', dirtySubmitListener);
}

/**
 * Returns an options object built from defaults, data attributes, and explicit options.
 *
 * Precedence:
 * defaults < data attributes < explicit options
 *
 * @param {HTMLElement} el
 * @param {Object} defaults
 * @param {Object} [options]
 * @returns {Object}
 */
function buildSettings(el, defaults, options = {}) {
  return {
    ...defaults,
    ...parseDataset(el, defaults),
    ...options
  };
}

/**
 * Parses supported data attributes and coerces values to the types defined by the defaults object.
 *
 * @param {HTMLElement} el
 * @param {Object} defaults
 * @returns {Object}
 */
function parseDataset(el, defaults) {
  return Object.fromEntries(
    Object.entries(el.dataset)
      .filter(([key]) => key in defaults)
      .map(([key, value]) => [key, coerce(value, defaults[key])])
  );
}

/**
 * Coerces a string to the type of a default value.
 *
 * @param {string} value
 * @param {*} defaultValue
 * @returns {*}
 */
function coerce(value, defaultValue) {
  if (typeof defaultValue === 'number') {
    return Number(value);
  }
  else if (typeof defaultValue === 'boolean') {
    return value === 'true';
  }

  return value;
}

export {
  getContext,
  initAll,
  initModalAutofocus,
  initCollapseAutoFocus,
  initModalShowOnError,
  dirtyCheck,
  buildSettings,
  parseDataset,
  coerce
};