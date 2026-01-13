function simulateInputEvent(inputEl, value) {
  if (['radio', 'checkbox'].includes(inputEl.type)) {
    inputEl.checked = value;
  }
  else {
    inputEl.value = value;
  }
  inputEl.dispatchEvent(new Event('input', {bubbles: true}));
}

export { simulateInputEvent }