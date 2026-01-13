//https://robinherbots.github.io/Inputmask/
import Inputmask from 'https://cdn.jsdelivr.net/npm/inputmask@5.0.9/+esm';

const maskMap = new Map();
let observer;

function initMask(selector, options) {
  initAll(document.body, selector, options);
  maskMap.set(selector, options);

  if (!observer) {
    observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, {subtree: true, childList: true})
  }
}

function mutationCallback(records) {
  const nodes = records.flatMap(r => [...r.addedNodes]);
  for (const element of nodes.filter(n => n instanceof Element)) {
    for (const [selector, options] of maskMap) {
      initAll(element, selector, options);
    }
  }
}

function initAll(element, selector, options) {
  if (element.matches(selector)) {
    Inputmask.default(options).mask(element);
  }
  else {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => Inputmask.default(options).mask(el));
  }
}

function phoneMask(selector = '[data-isp-toggle="phone-mask"]') {
  initMask(selector, {mask: '999-999-9999', placeholder: '#', inputmode: 'numeric'});
}

function zipMask(selector = '[data-isp-toggle="zip-mask"]') {
  initMask(selector, {mask: '99999[-9999]', placeholder: '#', inputmode: 'numeric'});
}

function ssnMask(selector = '[data-isp-toggle="ssn-mask"]') {
  initMask(selector, {mask: '999-99-9999', placeholder: '#', inputmode: 'numeric'});
}

function decimalMask(selector = '[data-isp-toggle="decimal-mask"]') {
  initMask(selector, {alias: 'decimal', groupSeparator: ',', digits: 2, digitsOptional: false, inputmode: 'numeric'});
}

function dateMask(selector = '[data-isp-toggle="date-mask"]') {
  initMask(selector, {alias: 'datetime', inputFormat: 'mm/dd/yyyy', inputmode: 'numeric'});
}

function dateTimeMask(selector = '[data-isp-toggle="date-time-mask"]') {
  initMask(selector, {alias: 'datetime', inputFormat: 'mm/dd/yyyy HH:MM', inputmode: 'numeric'});
}

function monthYearMask(selector = '[data-isp-toggle="month-year-mask"]') {
  initMask(selector, {alias: 'datetime', inputFormat: 'mm/yyyy', inputmode: 'numeric'});
}

function yearMask(selector = '[data-isp-toggle="year-mask"]') {
  initMask(selector, {alias: 'datetime', inputFormat: 'yyyy', inputmode: 'numeric'});
}

export { phoneMask, zipMask, ssnMask, decimalMask, dateMask, dateTimeMask, monthYearMask, yearMask };