import { getContext, initModalShowOnError } from "../js/Utils.js";
import { Collapse, Modal } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

function getContextTest(resolve, reject) {
  const resultEl = document.querySelector('#result1');
  getContext() === '/CDN' ? resolve(resultEl) : reject(resultEl);
}

function modalAutofocusTest(resolve, reject) {
  const resultEl = document.querySelector('#result2');
  const modalEl = document.querySelector('#modalAutofocusTest');
  const inputEl = modalEl.querySelectorAll('input')[4];
  const modal = Modal.getOrCreateInstance(modalEl);

  modalEl.addEventListener('shown.bs.modal', () => setTimeout(timeoutFn, 100));
  modal.show();

  function timeoutFn() {
    const isActive = document.activeElement === inputEl;
    modal.hide();
    isActive ? resolve(resultEl) : reject(resultEl);
  }
}

function collapseAutofocusTest(resolve, reject) {
  const resultEl = document.querySelector('#result3');
  const collapseEl = document.querySelector('#collapseAutofocusTest');
  const inputEl = collapseEl.querySelectorAll('input')[4];
  const collapse = Collapse.getOrCreateInstance(collapseEl, { toggle: false });

  collapseEl.addEventListener('shown.bs.collapse', () => setTimeout(timeoutFn, 100));
  collapse.show();

  function timeoutFn() {
    const isActive = document.activeElement === inputEl;
    collapse.hide();
    isActive ? resolve(resultEl) : reject(resultEl);
  }
}

function modalShowOnErrorTest(resolve, reject) {
  const resultEl = document.querySelector('#result4');
  const modalEl1 = document.querySelector('#errorModal1');
  const modalEl2 = document.querySelector('#errorModal2');
  let listener1, listener2;

  const promise1 = new Promise((res, rej) => {
    listener1 = () => {
      Modal.getOrCreateInstance(modalEl1).hide();
      res();
    };

    modalEl1.addEventListener('shown.bs.modal', listener1);
    setTimeout(() => rej(), 500);
  });

  const promise2 = new Promise((res, rej) => {
    listener2 = () => {
      Modal.getOrCreateInstance(modalEl2).hide();
      res();
    };

    modalEl2.addEventListener('shown.bs.modal', listener2);
    setTimeout(() => rej(), 500);
  });

  Promise.all([promise1, promise2])
    .then(() => cleanupAndReturn(resolve))
    .catch(() => cleanupAndReturn(reject));

  initModalShowOnError();

  function cleanupAndReturn(fn) {
    modalEl1.removeEventListener('shown.bs.modal', listener1);
    modalEl2.removeEventListener('shown.bs.modal', listener2);
    fn(resultEl);
  }
}

export const tests = [
  getContextTest,
  modalAutofocusTest,
  collapseAutofocusTest,
  modalShowOnErrorTest
];