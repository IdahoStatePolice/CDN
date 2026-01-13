import { Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

function getContext() {
  return window.location.pathname.substring(0, window.location.pathname.indexOf('/', 1));
}

function initModalAutofocus() {
  document.removeEventListener('shown.bs.modal', listener);
  document.addEventListener('shown.bs.modal', listener);

  function listener(e) {
    const els = e.target.querySelectorAll('[autofocus]');
    [...els].filter(el => el.checkVisibility())?.[0]?.focus();
  }
}

function initCollapseAutoFocus() {
  document.removeEventListener('shown.bs.collapse', listener);
  document.addEventListener('shown.bs.collapse', listener);

  function listener(e) {
    const inputs = e.target.querySelectorAll('[name]:not(.no-focus)');
    [...inputs].filter(e => e.checkVisibility())?.[0]?.focus();
  }
}

function initModalShowOnError() {
  for (const modalEl of document.querySelectorAll('.modal')) {
    const invalidEl = modalEl.querySelector('.is-invalid, .alert.alert-danger');

    if (invalidEl && modalEl.parentElement.checkVisibility()) {
      Modal.getOrCreateInstance(modalEl).show();
      setTimeout(() => invalidEl.scrollIntoView({behavior: 'smooth', block: 'center'}), 355);
    }
  }
}

function dirtyCheck() {
  document.addEventListener('change', () => {
    window.removeEventListener('beforeunload', preventNav);
    window.addEventListener('beforeunload', preventNav);
  });
  document.addEventListener('submit', () => window.removeEventListener('beforeunload', preventNav));

  function preventNav(e) {
    e.preventDefault();
    e.returnValue = 'Any changes made will be lost. Are you sure?';
    return 'Any changes made will be lost. Are you sure?';
  }
}

export { getContext, initModalAutofocus, initCollapseAutoFocus, initModalShowOnError, dirtyCheck };