async function copyTextToClipboard(resolve, reject) {
  const resultEl = document.querySelector('#result1');
  const testEl = document.querySelector('#test1');

  testEl.dispatchEvent(new Event('click', { bubbles: true }));
  const data = await navigator.clipboard.readText();

  data === '[NAME]' ? resolve(resultEl) : reject(resultEl);
}

async function copyTextFromElement(resolve, reject) {
  const resultEl = document.querySelector('#result2');
  const testEl = document.querySelector('#test2');

  testEl.dispatchEvent(new Event('click', { bubbles: true }));
  const data = await navigator.clipboard.readText();

  data === 'test@email.com' ? resolve(resultEl) : reject(resultEl);
}

async function copyTextFromInput(resolve, reject) {
  const resultEl = document.querySelector('#result3');
  const testEl = document.querySelector('#test3');

  testEl.dispatchEvent(new Event('click', { bubbles: true }));
  const data = await navigator.clipboard.readText();

  data === 'Lorem ipsum dolor sit amet.' ? resolve(resultEl) : reject(resultEl);
}

export const tests = [
  copyTextToClipboard,
  copyTextFromElement,
  copyTextFromInput
]