import { simulateInputEvent } from "./z-test-utils.js";

function defaultInitTest(resolve, reject) {
  const textareaEl = document.querySelector('#countdown1');
  const formTextEl = textareaEl.nextElementSibling;
  const resultEl = document.querySelector('#result1');

  const success1 = textareaEl.maxLength === 255;
  const success2 = formTextEl.matches('div.form-text');
  const success3 = formTextEl.innerText === 'Characters remaining: 255';
  const initSuccess = success1 && success2 && success3;

  simulateInputEvent(textareaEl, 'a');
  const success4 = formTextEl.innerText === 'Characters remaining: 254';

  simulateInputEvent(textareaEl, '');
  const success5 = formTextEl.innerText === 'Characters remaining: 255';
  const countSuccess = success4 && success5;

  initSuccess && countSuccess ? resolve(resultEl) : reject(resultEl);
}

function maxlengthInitTest(resolve, reject) {
  const textareaEl = document.querySelector('#countdown2');
  const formTextEl = textareaEl.nextElementSibling;
  const resultEl = document.querySelector('#result2');

  const success1 = textareaEl.maxLength === 4000;
  const success2 = formTextEl.matches('div.form-text');
  const success3 = formTextEl.innerText === 'Characters remaining: 4000';
  const initSuccess = success1 && success2 && success3;

  simulateInputEvent(textareaEl, 'a');
  const success4 = formTextEl.innerText === 'Characters remaining: 3999';

  simulateInputEvent(textareaEl, '');
  const success5 = formTextEl.innerText === 'Characters remaining: 4000';
  const countSuccess = success4 && success5;

  initSuccess && countSuccess ? resolve(resultEl) : reject(resultEl);
}

function labelInitTest(resolve, reject) {
  const textareaEl = document.querySelector('#countdown3');
  const formTextEl = textareaEl.nextElementSibling;
  const resultEl = document.querySelector('#result3');

  const success1 = textareaEl.maxLength === 4000;
  const success2 = formTextEl.matches('div.form-text');
  const success3 = formTextEl.innerText === 'Char Left: 4000';
  const initSuccess = success1 && success2 && success3;

  simulateInputEvent(textareaEl, 'a');
  const success4 = formTextEl.innerText === 'Char Left: 3999';

  simulateInputEvent(textareaEl, '');
  const success5 = formTextEl.innerText === 'Char Left: 4000';
  const countSuccess = success4 && success5;

  initSuccess && countSuccess ? resolve(resultEl) : reject(resultEl);
}

function showAllInitTest(resolve, reject) {
  const textareaEl = document.querySelector('#countdown4');
  const formTextEl = textareaEl.nextElementSibling;
  const resultEl = document.querySelector('#result4');
  const initialHeight = calcHeight();

  const success1 = textareaEl.maxLength === 4000;
  const success2 = formTextEl.matches('div.form-text');
  const success3 = formTextEl.innerText === 'Characters remaining: 4000';
  const initSuccess = success1 && success2 && success3;

  simulateInputEvent(textareaEl, 'bob\nbob\nbob');
  const success4 = formTextEl.innerText === 'Characters remaining: 3989';
  const success5 = initialHeight < calcHeight();

  simulateInputEvent(textareaEl, '');
  const success6 = formTextEl.innerText === 'Characters remaining: 4000';
  const success7 = initialHeight === calcHeight();
  const countSuccess = success4 && success5 && success6 && success7;

  initSuccess && countSuccess ? resolve(resultEl) : reject(resultEl);

  function calcHeight() {
    const borderWidth = window.getComputedStyle(textareaEl).borderWidth;
    return textareaEl.clientHeight + (parseFloat(borderWidth) * 2);
  }
}

export const tests = [
  defaultInitTest,
  maxlengthInitTest,
  labelInitTest,
  showAllInitTest
];