function navigateToHrefTest(resolve, reject) {
  const tableEl = document.querySelector('#table1');
  const tableCellEl = tableEl.querySelector('td');
  const resultEl = document.querySelector('#result1');

  let success = false;
  const originalOpenFunction = window.open;
  window.open = () => {success = true;};

  tableCellEl.click();
  window.open = originalOpenFunction;
  success ? resolve(resultEl) : reject(resultEl);
}

function noNavigateToHrefOnNoClickTest(resolve, reject) {
  const tableEl = document.querySelector('#table1');
  const modalTriggerEl = tableEl.querySelector('a');
  const modalCloseBtn = document.querySelector('#doStuffModal [data-bs-dismiss="modal"]');
  const resultEl = document.querySelector('#result2');

  let success = true;
  const originalOpenFunction = window.open;
  window.open = () => {success = false;};

  modalTriggerEl.click();
  window.open = originalOpenFunction;

  setTimeout(() => {
    modalCloseBtn.click();
    success ? resolve(resultEl) : reject(resultEl);
  }, 500);
}

export const tests = [
  navigateToHrefTest,
  noNavigateToHrefOnNoClickTest
];