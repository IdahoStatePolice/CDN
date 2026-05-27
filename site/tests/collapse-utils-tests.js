import { simulateInputEvent } from "./z-test-utils.js";

function testRadioCollapse1Shows(resolve, reject) {
  const collapseEl = document.querySelector('#radioCollapse1');
  const triggerEl = document.querySelector('#radioCollapse1Trigger1');
  const resultEl = document.querySelector('#radioCollapse1Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testRadioCollapse1Hides(resolve, reject) {
  const collapseEl = document.querySelector('#radioCollapse1');
  const triggerEl = document.querySelector('#radioCollapse1Trigger2');
  const resultEl = document.querySelector('#radioCollapse1Result2');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse1CheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse1');
  const triggerEl = document.querySelector('#checkboxCollapse1Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse1Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse1UnCheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse1');
  const triggerEl = document.querySelector('#checkboxCollapse1Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse1Result2');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1CheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse2Result2');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse2Result3');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1UnCheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result4');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2CheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse2Result5');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result6');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result7');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2UnCheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse2Result8');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse1Shows(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse1');
  const triggerEl = document.querySelector('#selectCollapse1Trigger1');
  const resultEl = document.querySelector('#selectCollapse1Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, 'other');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse1Hides(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse1');
  const triggerEl = document.querySelector('#selectCollapse1Trigger1');
  const resultEl = document.querySelector('#selectCollapse1Result2');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse2Shows(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse2');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse2Result1');

  let success = false;
  collapseEl.addEventListener('show.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '1');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse2Hides(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse2');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse2Result2');

  let success = false;
  collapseEl.addEventListener('hide.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse3Shows(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse3');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse3Result1');

  let success = false;
  collapseEl.addEventListener('show.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '2');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse3Hides(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse3');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse3Result2');

  let success = false;
  collapseEl.addEventListener('hide.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse4Shows(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse4');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse4Result1');

  let success = false;
  collapseEl.addEventListener('show.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '3');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse4Hides(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse4');
  const triggerEl = document.querySelector('#selectCollapse234Trigger1');
  const resultEl = document.querySelector('#selectCollapse4Result2');

  let success = false;
  collapseEl.addEventListener('hide.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

export const tests = [
  testRadioCollapse1Shows,
  testRadioCollapse1Hides,
  testCheckboxCollapse1CheckedShows,
  testCheckboxCollapse1UnCheckedHides,

  testCheckboxCollapse3Checkbox1CheckedShows,
  testCheckboxCollapse3Checkbox2CheckedNothing,
  testCheckboxCollapse3Checkbox2UnCheckedNothing,
  testCheckboxCollapse3Checkbox1UnCheckedHides,
  testCheckboxCollapse3Checkbox2CheckedShows,
  testCheckboxCollapse3Checkbox1CheckedNothing,
  testCheckboxCollapse3Checkbox1UnCheckedNothing,
  testCheckboxCollapse3Checkbox2UnCheckedHides,

  testSelectCollapse1Shows,
  testSelectCollapse1Hides,

  testSelectCollapse2Shows,
  testSelectCollapse2Hides,
  testSelectCollapse3Shows,
  testSelectCollapse3Hides,
  testSelectCollapse4Shows,
  testSelectCollapse4Hides
];