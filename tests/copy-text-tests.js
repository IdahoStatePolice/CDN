function test(resolve, reject) {
  const resultEl = document.querySelector('#result1');
  let success;

  // report success or failure with the following example
  success ? resolve(resultEl) : reject(resultEl);
}

export const tests = [
  test
]