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

function testRadioCollapse2Shows(resolve, reject) {
  const collapseEl = document.querySelector('#radioCollapse2');
  const triggerEl = document.querySelector('#radioCollapse2Trigger1');
  const resultEl = document.querySelector('#radioCollapse2Result1');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testRadioCollapse2Hides(resolve, reject) {
  const collapseEl = document.querySelector('#radioCollapse2');
  const triggerEl = document.querySelector('#radioCollapse2Trigger2');
  const resultEl = document.querySelector('#radioCollapse2Result2');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
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

function testCheckboxCollapse2CheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result1');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse2UnCheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse2');
  const triggerEl = document.querySelector('#checkboxCollapse2Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse2Result2');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1CheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse3Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse3Result2');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse3Result3');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1UnCheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse3Result4');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2CheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse3Result5');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse3Result6');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox1UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse3Result7');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse3Checkbox2UnCheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse3');
  const triggerEl = document.querySelector('#checkboxCollapse3Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse3Result8');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox1CheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse4Result1');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox2CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse4Result2');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox2UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse4Result3');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox1UnCheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse4Result4');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox2CheckedHides(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse4Result5');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox1CheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse4Result6');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, true);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox1UnCheckedNothing(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger1');
  const resultEl = document.querySelector('#checkboxCollapse4Result7');

  let success = true;
  collapseEl.addEventListener('shown.bs.collapse', () => success = false);
  collapseEl.addEventListener('hidden.bs.collapse', () => success = false);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testCheckboxCollapse4Checkbox2UnCheckedShows(resolve, reject) {
  const collapseEl = document.querySelector('#checkboxCollapse4');
  const triggerEl = document.querySelector('#checkboxCollapse4Trigger2');
  const resultEl = document.querySelector('#checkboxCollapse4Result8');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, false);
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse1Shows(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse1');
  const triggerEl = document.querySelector('#selectCollapse1Trigger1');
  const resultEl = document.querySelector('#selectCollapse1Result1');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, 'Show');
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
  const triggerEl = document.querySelector('#selectCollapse2Trigger1');
  const resultEl = document.querySelector('#selectCollapse2Result1');

  let success = false;
  collapseEl.addEventListener('hidden.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, 'Hide');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse2Hides(resolve, reject) {
  const collapseEl = document.querySelector('#selectCollapse2');
  const triggerEl = document.querySelector('#selectCollapse2Trigger1');
  const resultEl = document.querySelector('#selectCollapse2Result2');

  let success = false;
  collapseEl.addEventListener('shown.bs.collapse', () => success = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse3Shows(resolve, reject) {
  const collapse3El = document.querySelector('#selectCollapse3');
  const collapse4El = document.querySelector('#selectCollapse4');
  const triggerEl = document.querySelector('#selectCollapse34Trigger1');
  const resultEl = document.querySelector('#selectCollapse34Result1');

  let success1 = false;
  let success2 = true;
  collapse3El.addEventListener('shown.bs.collapse', () => success1 = true);
  collapse4El.addEventListener('shown.bs.collapse', () => success2 = false);
  simulateInputEvent(triggerEl, '1st');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse4Shows(resolve, reject) {
  const collapse3El = document.querySelector('#selectCollapse3');
  const collapse4El = document.querySelector('#selectCollapse4');
  const triggerEl = document.querySelector('#selectCollapse34Trigger1');
  const resultEl = document.querySelector('#selectCollapse34Result2');

  let success1 = false;
  let success2 = false;
  collapse3El.addEventListener('hidden.bs.collapse', () => success1 = true);
  collapse4El.addEventListener('shown.bs.collapse', () => success2 = true);
  simulateInputEvent(triggerEl, '2nd');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse34Hides(resolve, reject) {
  const collapse3El = document.querySelector('#selectCollapse3');
  const collapse4El = document.querySelector('#selectCollapse4');
  const triggerEl = document.querySelector('#selectCollapse34Trigger1');
  const resultEl = document.querySelector('#selectCollapse34Result3');

  let success1 = true;
  let success2 = false;
  collapse3El.addEventListener('shown.bs.collapse', () => success1 = false);
  collapse3El.addEventListener('hidden.bs.collapse', () => success1 = false);
  collapse4El.addEventListener('hidden.bs.collapse', () => success2 = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse5Hides(resolve, reject) {
  const collapse5El = document.querySelector('#selectCollapse5');
  const collapse6El = document.querySelector('#selectCollapse6');
  const triggerEl = document.querySelector('#selectCollapse56Trigger1');
  const resultEl = document.querySelector('#selectCollapse56Result1');

  let success1 = false;
  let success2 = true;
  collapse5El.addEventListener('hidden.bs.collapse', () => success1 = true);
  collapse6El.addEventListener('hidden.bs.collapse', () => success2 = false);
  simulateInputEvent(triggerEl, '1st');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse6Hides(resolve, reject) {
  const collapse5El = document.querySelector('#selectCollapse5');
  const collapse6El = document.querySelector('#selectCollapse6');
  const triggerEl = document.querySelector('#selectCollapse56Trigger1');
  const resultEl = document.querySelector('#selectCollapse56Result2');

  let success1 = false;
  let success2 = false;
  collapse5El.addEventListener('shown.bs.collapse', () => success1 = true);
  collapse6El.addEventListener('hidden.bs.collapse', () => success2 = true);
  simulateInputEvent(triggerEl, '2nd');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

function testSelectCollapse56Shows(resolve, reject) {
  const collapse5El = document.querySelector('#selectCollapse5');
  const collapse6El = document.querySelector('#selectCollapse6');
  const triggerEl = document.querySelector('#selectCollapse56Trigger1');
  const resultEl = document.querySelector('#selectCollapse56Result3');

  let success1 = true;
  let success2 = false;
  collapse5El.addEventListener('hidden.bs.collapse', () => success1 = false);
  collapse5El.addEventListener('shown.bs.collapse', () => success1 = false);
  collapse6El.addEventListener('shown.bs.collapse', () => success2 = true);
  simulateInputEvent(triggerEl, '');
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 400);
}

export const tests = [
  testRadioCollapse1Shows,
  testRadioCollapse1Hides,

  testRadioCollapse2Shows,
  testRadioCollapse2Hides,

  testCheckboxCollapse1CheckedShows,
  testCheckboxCollapse1UnCheckedHides,

  testCheckboxCollapse2CheckedHides,
  testCheckboxCollapse2UnCheckedShows,

  testCheckboxCollapse3Checkbox1CheckedShows,
  testCheckboxCollapse3Checkbox2CheckedNothing,
  testCheckboxCollapse3Checkbox2UnCheckedNothing,
  testCheckboxCollapse3Checkbox1UnCheckedHides,
  testCheckboxCollapse3Checkbox2CheckedShows,
  testCheckboxCollapse3Checkbox1CheckedNothing,
  testCheckboxCollapse3Checkbox1UnCheckedNothing,
  testCheckboxCollapse3Checkbox2UnCheckedHides,

  testCheckboxCollapse4Checkbox1CheckedHides,
  testCheckboxCollapse4Checkbox2CheckedNothing,
  testCheckboxCollapse4Checkbox2UnCheckedNothing,
  testCheckboxCollapse4Checkbox1UnCheckedShows,
  testCheckboxCollapse4Checkbox2CheckedHides,
  testCheckboxCollapse4Checkbox1CheckedNothing,
  testCheckboxCollapse4Checkbox1UnCheckedNothing,
  testCheckboxCollapse4Checkbox2UnCheckedShows,

  testSelectCollapse1Shows,
  testSelectCollapse1Hides,

  testSelectCollapse2Shows,
  testSelectCollapse2Hides,

  testSelectCollapse3Shows,
  testSelectCollapse4Shows,
  testSelectCollapse34Hides,

  testSelectCollapse5Hides,
  testSelectCollapse6Hides,
  testSelectCollapse56Shows
];