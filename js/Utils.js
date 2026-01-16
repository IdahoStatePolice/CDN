import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

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
 * @param {string} [modalSelector = '.modal'] - The selector used to decide which modals to search.
 * @param {string} [errorSelector = '.is-invalid, .alert.alert-danger'] - The selector used to check if an error exists inside the modal.
 */
function initModalShowOnError(modalSelector = '.modal', errorSelector = '.is-invalid, .alert.alert-danger') {
  for (const modalEl of document.querySelectorAll(modalSelector)) {
    const invalidEl = modalEl.querySelector(errorSelector);

    if (invalidEl && modalEl.parentElement.checkVisibility()) {
      Modal.getOrCreateInstance(modalEl).show();
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

export { getContext, initModalAutofocus, initCollapseAutoFocus, initModalShowOnError, dirtyCheck };