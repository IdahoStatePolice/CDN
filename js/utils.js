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

const dirtyChangeListener = (e) => {
  if (e.target.closest('[data-dirty-ignore]')) {
    return;
  }

  window.removeEventListener('beforeunload', preventNav);
  window.addEventListener('beforeunload', preventNav);
};

const dirtySubmitListener = () => window.removeEventListener('beforeunload', preventNav);

/**
 * This function initializes a collection of event listeners based on
 * the `beforeunload` event to prevent users from leaving the page.
 *
 * @deprecated Use `DirtyCheck` component class instead. Removing in future version.
 */
function dirtyCheck() {
  document.removeEventListener('change', dirtyChangeListener);
  document.removeEventListener('submit', dirtySubmitListener);

  document.addEventListener('change', dirtyChangeListener);
  document.addEventListener('submit', dirtySubmitListener);
}

/**
 * @returns {string} the current server context.
 */
function getContext() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1));
}

/**
 * Attach a delegated event listener to a parent element.
 * The handler runs when the event bubbles from a descendant matching `selector`.
 * This works for elements that already exist and for elements added later.
 *
 * @template {Element} T
 * @param {ParentNode & EventTarget} parent - Element or document to listen on.
 * @param {string} eventType - Event name, such as "click" or "input".
 * @param {string} selector - CSS selector used to match the event target or its ancestors.
 * @param {(event: Event, match: T) => void} handler - Called when a matching descendant triggers the event.
 * @returns {void}
 */
function on(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (e) => {
    const match = e.target.closest(selector);
    if (match && parent.contains(match)) {
      handler.call(match, e);
    }
  });
}

/**
 * Calls the initializer callback for each element matching the CSS selector.
 * Optionally registers a MutationObserver to automatically initialize matching
 * elements added to the DOM after the initial call, and (when a destroyer is
 * supplied) to tear down matching elements that are removed from the DOM.
 *
 * Each element is initialized at most once per call to initAll, even if it is
 * detached and re-attached. When a destroyer runs for an element, that element
 * becomes eligible for initialization again.
 *
 * @param {string} selector - CSS selector identifying target elements.
 * @param {(el: Element) => void} initializer - Function to run on each matched element.
 * @param {boolean} [registerMutationObserver=true] - When true, observes the DOM
 *   for dynamically added elements matching the selector and runs the initializer
 *   on them automatically. Disable if the component is initialized in a context
 *   where DOM observation is unnecessary or unwanted (e.g., one-time static render).
 * @param {(el: Element) => void} [destroyer] - Optional teardown run on matching
 *   elements that are removed from the DOM (and not re-attached). Only used when
 *   registerMutationObserver is true.
 *
 * @returns {MutationObserver|undefined} The observer instance, if one was registered.
 *   On single-page apps, call .disconnect() to stop observing when the component is removed.
 */
function initAll(selector, initializer, registerMutationObserver = true, destroyer) {
  /** @type {WeakSet<Element>} */
  const initialized = new WeakSet();

  const initializeOnce = (el) => {
    if (!initialized.has(el)) {
      initialized.add(el);
      initializer(el);
    }
  };

  const destroyIfDetached = (el) => {
    if (initialized.has(el) && !el.isConnected) {
      initialized.delete(el);
      destroyer(el);
    }
  };

  const matchesAndDescendants = (root) => {
    const found = root.matches(selector) ? [root] : [];
    return found.concat([...root.querySelectorAll(selector)]);
  };

  document.querySelectorAll(selector).forEach(initializeOnce);

  if (registerMutationObserver) {
    const mutationCallback = (records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element && node.isConnected) {
            matchesAndDescendants(node).forEach(initializeOnce);
          }
        }
        if (destroyer) {
          for (const node of record.removedNodes) {
            if (node instanceof Element) {
              matchesAndDescendants(node).forEach(destroyIfDetached);
            }
          }
        }
      }
    };

    const observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, { subtree: true, childList: true });
    return observer;
  }
}

/**
 * Convention-based wrapper around initAll for component classes that provide:
 *   - static SELECTOR            (the default selector)
 *   - constructor(element, options)
 * and optionally:
 *   - static for(element)        (registry lookup)
 *   - instance destroy()         (teardown)
 *
 * @template T
 * @param {{ SELECTOR: string, new (el: Element, options?: object): T, for?: (el: Element) => { destroy?: () => void } | undefined }} ComponentClass
 * @param {object} [options] - Passed to every constructed instance.
 * @param {boolean} [registerMutationObserver=true]
 * @returns {MutationObserver|undefined}
 */
function initComponent(ComponentClass, options = {}, registerMutationObserver = true) {
  return initAll(
    ComponentClass.SELECTOR,
    (el) => new ComponentClass(el, options),
    registerMutationObserver,
    (el) => ComponentClass.for?.(el)?.destroy?.()
  );
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
 * Returns an options object built from defaults, constructor options, and data attributes.
 *
 * Precedence:
 * defaults < constructor options < data attributes < element properties
 *
 * @example <caption>For string-only settings, consider inlining:</caption>
 * Object.assign({}, Component.#DEFAULTS, options, this.#el.dataset);
 *
 * @template {Object} T
 * @param {T} defaults
 * @param {Partial<T>} [options]
 * @param {HTMLElement} [el]
 * @param {Partial<T>} [elProps]
 * @returns {T}
 */
function resolveSettings(defaults, options = {}, el = null, elProps = {}) {
  return {
    ...defaults,
    ...options,
    ...(el && el.dataset ? parseDataset(el, defaults) : {}),
    ...elProps
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
    const trimmed = value.trim();
    const result = Number(trimmed);

    if (trimmed === '' || !Number.isFinite(result)) {
      console.warn(`Invalid numeric value "${value}"; using default ${defaultValue}.`);
      return defaultValue;
    }

    return result;
  }
  else if (typeof defaultValue === 'boolean') {
    return value === '' || value.toLowerCase() === 'true';
  }

  return value;
}

export {
  getContext,
  on,
  initAll,
  initComponent,
  initModalAutofocus,
  initCollapseAutoFocus,
  initModalShowOnError,
  dirtyCheck,
  resolveSettings,
  parseDataset,
  coerce
};