//https://robinherbots.github.io/Inputmask/
import Inputmask from 'https://cdn.jsdelivr.net/npm/inputmask@5.0.9/+esm';

const maskMap = new Map();
let observer;

function initMask(selector, options) {
  initAll(document.body, selector, options);
  maskMap.set(selector, options);

  if (!observer) {
    observer = new MutationObserver(mutationCallback);
    observer.observe(document.body, { subtree: true, childList: true })
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

/**
 * Initialize text inputs as phone number inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="phone-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-1|Phone Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function phoneMask(selector = '[data-isp-toggle="phone-mask"]') {
  initMask(selector, { mask: '999-999-9999', placeholder: '#', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as zip code inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="zip-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-2|Zip Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function zipMask(selector = '[data-isp-toggle="zip-mask"]') {
  initMask(selector, { mask: '99999[-9999]', placeholder: '#', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as ssn inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="ssn-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-3|SSN Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function ssnMask(selector = '[data-isp-toggle="ssn-mask"]') {
  initMask(selector, { mask: '999-99-9999', placeholder: '#', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as decimal inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="decimal-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-4|Decimal Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function decimalMask(selector = '[data-isp-toggle="decimal-mask"]') {
  initMask(selector, { alias: 'decimal', groupSeparator: ',', digits: 2, digitsOptional: false, inputmode: 'numeric' });
}

/**
 * Initialize text inputs as date inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="date-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-5|Date Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function dateMask(selector = '[data-isp-toggle="date-mask"]') {
  initMask(selector, { alias: 'datetime', inputFormat: 'mm/dd/yyyy', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as date time inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="date-time-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-6|Date Time Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function dateTimeMask(selector = '[data-isp-toggle="date-time-mask"]') {
  initMask(selector, { alias: 'datetime', inputFormat: 'mm/dd/yyyy HH:MM', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as month year inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="month-year-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-7|Month Year Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function monthYearMask(selector = '[data-isp-toggle="month-year-mask"]') {
  initMask(selector, { alias: 'datetime', inputFormat: 'mm/yyyy', inputmode: 'numeric' });
}

/**
 * Initialize text inputs as year inputs.
 *
 * @param {string} [selector = '[data-isp-toggle="year-mask"]'] - The selector used to find inputs.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/mask.html#card-8|Year Mask Docs}
 * @see {@link https://robinherbots.github.io/Inputmask/|Inputmask}
 */
function yearMask(selector = '[data-isp-toggle="year-mask"]') {
  initMask(selector, { alias: 'datetime', inputFormat: 'yyyy', inputmode: 'numeric' });
}

export { phoneMask, zipMask, ssnMask, decimalMask, dateMask, dateTimeMask, monthYearMask, yearMask };