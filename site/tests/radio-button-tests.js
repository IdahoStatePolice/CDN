function deselectTest(resolve, reject) {
  const resultEl = document.querySelector('#result1');
  const yesBtn = document.querySelector('[data-name="name1"] > [value="true"]');
  const hiddenInput = document.querySelector('[name="name1"]');

  if (hiddenInput.value !== 'true') {
    yesBtn.click();
  }
  yesBtn.click();

  hiddenInput.value === '' ? resolve(resultEl) : reject(resultEl);
}

function changeValueTest(resolve, reject) {
  const resultEl = document.querySelector('#result2');
  const yesBtn = document.querySelector('[data-name="name1"] > [value="true"]');
  const noBtn = document.querySelector('[data-name="name1"] > [value="false"]');
  const hiddenInput = document.querySelector('[name="name1"]');

  if (hiddenInput.value !== 'true') {
    yesBtn.click();
  }
  noBtn.click();

  hiddenInput.value === 'false' ? resolve(resultEl) : reject(resultEl);
}

export const tests = [
  deselectTest,
  changeValueTest
];