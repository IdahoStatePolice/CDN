function basicConfirmCancelTest(resolve, reject) {
  const formEl = document.querySelector('#basicConfirmForm');
  const btnEl = document.querySelector('#basicConfirmBtn');
  const resultEl = document.querySelector('#basicConfirmResult1');

  let success = true;
  const onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    success = false;
  }

  formEl.addEventListener('submit', onSubmit);
  onConfirmationSimulateNoClick();
  btnEl.click();

  setTimeout(() => {
    formEl.removeEventListener('submit', onSubmit);
    success ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

function basicConfirmTest(resolve, reject) {
  const formEl = document.querySelector('#basicConfirmForm');
  const btnEl = document.querySelector('#basicConfirmBtn');
  const resultEl = document.querySelector('#basicConfirmResult2');

  let success = false;
  const onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    success = true
  };

  formEl.addEventListener('submit', onSubmit);
  onConfirmationSimulateYesClick();
  btnEl.click();

  setTimeout(() => {
    formEl.removeEventListener('submit', onSubmit);
    success ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

function btnNotInFormTest(resolve, reject) {
  const formEl = document.querySelector('#btnNotInFormForm');
  const btnEl = document.querySelector('#btnNotInFormBtn');
  const resultEl = document.querySelector('#btnNotInFormResult1');

  let success = false;
  const onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    success = true
  };

  formEl.addEventListener('submit', onSubmit);
  onConfirmationSimulateYesClick();
  btnEl.click();

  setTimeout(() => {
    formEl.removeEventListener('submit', onSubmit);
    success ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

function btnValueSubmittedTest(resolve, reject) {
  const formEl = document.querySelector('#btnValueSubmittedForm');
  const btnEl = document.querySelector('#btnValueSubmittedBtn');
  const resultEl = document.querySelector('#btnValueSubmittedResult1');

  let success = false;
  const onSubmit = e => {
    e.preventDefault();
    e.stopPropagation();
    success = (e.submitter === btnEl);
  };

  formEl.addEventListener('submit', onSubmit);
  onConfirmationSimulateYesClick();
  btnEl.click();

  setTimeout(() => {
    formEl.removeEventListener('submit', onSubmit);
    success ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

function customTitleTest(resolve, reject) {
  const btnEl = document.querySelector('#customTextBtn');
  const resultEl = document.querySelector('#customTextResult1');

  let success = false;
  onConfirmationSimulateNoClick(e => {
    const el = e.target.querySelector('.modal-title');
    success = (el.innerText === 'custom title');
  });
  btnEl.click();
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 500);
}

function customBodyTest(resolve, reject) {
  const btnEl = document.querySelector('#customTextBtn');
  const resultEl = document.querySelector('#customTextResult2');

  let success = false;
  onConfirmationSimulateNoClick(e => {
    const el = e.target.querySelector('.modal-body');
    success = (el.firstElementChild.innerText === 'custom body');
  });
  btnEl.click();
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 500);
}

function customYesLabelTest(resolve, reject) {
  const btnEl = document.querySelector('#customTextBtn');
  const resultEl = document.querySelector('#customTextResult3');

  let success = false;
  onConfirmationSimulateNoClick(e => {
    const el = e.target.querySelector('[data-confirm-yes]')
    success = (el.innerText === 'custom yes label');
  });
  btnEl.click();
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 500);
}

function customNoLabelTest(resolve, reject) {
  const btnEl = document.querySelector('#customTextBtn');
  const resultEl = document.querySelector('#customTextResult4');

  let success = false;
  onConfirmationSimulateNoClick(e => {
    const el = e.target.querySelector('[data-confirm-no]')
    success = (el.innerText === 'custom no label');
  });
  btnEl.click();
  setTimeout(() => success ? resolve(resultEl) : reject(resultEl), 500);
}

function linkConfirmationTest(resolve, reject) {
  const linkEl = document.querySelector('#linkConfirmationLink');
  const resultEl = document.querySelector('#linkConfirmationResult1');

  let success1 = true;
  let success2 = false;
  const onClickFails = () => success1 = false;

  linkEl.addEventListener('click', onClickFails);
  linkEl.click();
  linkEl.removeEventListener('click', onClickFails);
  linkEl.addEventListener('click', () => success2 = true);
  onConfirmationSimulateYesClick();
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 500);
}

function btnConfirmationTest(resolve, reject) {
  const btnEl = document.querySelector('#btnConfirmationBtn');
  const resultEl = document.querySelector('#btnConfirmationResult1');

  let success1 = true;
  let success2 = false;
  const onClickFails = () => success1 = false;

  btnEl.addEventListener('click', onClickFails);
  btnEl.click();
  btnEl.removeEventListener('click', onClickFails);
  btnEl.addEventListener('click', () => success2 = true);
  onConfirmationSimulateYesClick();
  setTimeout(() => success1 && success2 ? resolve(resultEl) : reject(resultEl), 500);
}

function formConfirmationTest(resolve, reject) {
  const formEl = document.querySelector('#formConfirmForm');
  const btnEl = document.querySelector('#formConfirmBtn');
  const resultEl = document.querySelector('#formConfirmResult1');

  let success1 = true;
  let success2 = false;
  const onSubmitFails = () => success1 = false;
  const onSubmitSuccess = e => {
    e.preventDefault();
    e.stopPropagation();
    success2 = true;
  };

  formEl.addEventListener('submit', onSubmitFails);
  btnEl.click();
  formEl.removeEventListener('submit', onSubmitFails);
  formEl.addEventListener('submit', onSubmitSuccess);
  onConfirmationSimulateYesClick();
  setTimeout(() => {
    formEl.removeEventListener('submit', onSubmitSuccess);
    success1 && success2 ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

function onConfirmationSimulateNoClick(beforeClickFn) {
  document.addEventListener('shown.bs.modal', simulateNoClick);

  function simulateNoClick(e) {
    if (beforeClickFn) {
      beforeClickFn(e);
    }
    e.target.querySelector('[data-confirm-no]').click();
    document.removeEventListener('shown.bs.modal', simulateNoClick);
  }
}

function onConfirmationSimulateYesClick(beforeClickFn) {
  document.addEventListener('shown.bs.modal', simulateYesClick);

  function simulateYesClick(e) {
    if (beforeClickFn) {
      beforeClickFn(e);
    }
    e.target.querySelector('[data-confirm-yes]').click();
    document.removeEventListener('shown.bs.modal', simulateYesClick);
  }
}

export const tests = [
  basicConfirmCancelTest,
  basicConfirmTest,
  btnNotInFormTest,
  btnValueSubmittedTest,

  customTitleTest,
  customBodyTest,
  customYesLabelTest,
  customNoLabelTest,

  linkConfirmationTest,
  btnConfirmationTest,
  formConfirmationTest
];