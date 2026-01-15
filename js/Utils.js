import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

const modalListener = function(e) {
  const els = e.target.querySelectorAll('[autofocus]');
  [...els].filter(el => el.checkVisibility())?.[0]?.focus();
}

const collapseListener = function(e) {
  const inputs = e.target.querySelectorAll('[autofocus]');
  [...inputs].filter(e => e.checkVisibility())?.[0]?.focus();
}

const preventNav = function(e) {
  e.preventDefault();
  e.returnValue = 'Any changes made will be lost. Are you sure?';
  return 'Any changes made will be lost. Are you sure?';
}

/**
 * @returns {string} the current server context.
 */
function getContext() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1));
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
 * On page load, if a modal matching the selector has an element matching `.is-invalid, .alert.alert-danger`, it will be shown.
 *
 * @param {string} [selector = '.modal'] - The selector used to decide which modals to search.
 */
function initModalShowOnError(selector = '.modal') {
  for (const modalEl of document.querySelectorAll(selector)) {
    const invalidEl = modalEl.querySelector('.is-invalid, .alert.alert-danger');

    if (invalidEl && modalEl.parentElement.checkVisibility()) {
      Modal.getOrCreateInstance(modalEl).show();
      setTimeout(() => invalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 355);
    }
  }
}

function dirtyCheck() {
  document.addEventListener('change', () => {
    window.removeEventListener('beforeunload', preventNav);
    window.addEventListener('beforeunload', preventNav);
  });
  document.addEventListener('submit', () => window.removeEventListener('beforeunload', preventNav));
}

export { getContext, initModalAutofocus, initCollapseAutoFocus, initModalShowOnError, dirtyCheck };