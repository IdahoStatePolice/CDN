function addingPhoneMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test1');
  const templateEl = document.querySelector('#template1');
  const resultEl = document.querySelector('#result1');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingZipMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test2');
  const templateEl = document.querySelector('#template2');
  const resultEl = document.querySelector('#result2');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingSsnMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test3');
  const templateEl = document.querySelector('#template3');
  const resultEl = document.querySelector('#result3');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingDecimalMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test4');
  const templateEl = document.querySelector('#template4');
  const resultEl = document.querySelector('#result4');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingDateMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test5');
  const templateEl = document.querySelector('#template5');
  const resultEl = document.querySelector('#result5');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingDateTimeMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test6');
  const templateEl = document.querySelector('#template6');
  const resultEl = document.querySelector('#result6');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingMonthYearMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test7');
  const templateEl = document.querySelector('#template7');
  const resultEl = document.querySelector('#result7');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function addingYearMaskInputTest(resolve, reject) {
  const testEl = document.querySelector('#test8');
  const templateEl = document.querySelector('#template8');
  const resultEl = document.querySelector('#result8');

  testEl.insertAdjacentHTML('beforeend', templateEl.innerHTML);
  setTimeout(() => checkForInputmask(testEl) ? resolve(resultEl) : reject(resultEl), 100);
}

function checkForInputmask(divEl) {
  let success = true;

  for (const el of divEl.children) {
    if (!el['inputmask']) {
      success = false;
      break;
    }
  }

  divEl.children[1].remove();
  return success;
}

export const tests = [
  addingPhoneMaskInputTest,
  addingZipMaskInputTest,
  addingSsnMaskInputTest,
  addingDecimalMaskInputTest,
  addingDateMaskInputTest,
  addingDateTimeMaskInputTest,
  addingMonthYearMaskInputTest,
  addingYearMaskInputTest
];