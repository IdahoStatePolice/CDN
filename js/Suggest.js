import { Spinner } from "./Spinner.js";

/**
 * @typedef {HTMLElement} HTMLListItem
 * @prop {any} suggestItem - One of the items received from the list.
 */

/**
 * Takes a URI encoded query string and returns a complete URL for a fetch query.
 *
 * @typedef {(uriEncodedQuery: string) => string} URLFactory
 */

/**
 * Takes a URL `string` and returns a `Promise` that resolved into and `Array` of any `Object`.
 *
 * @typedef {(query: string) => Promise<Array<any>>} SearchFunction
 */

/**
 * @typedef {(item: any) => string} LabelFunction
 */

/**
 * Takes the query and the label and returns the label with the query highlighted with mark tags.
 *
 * @typedef {(query: string, label: string) => string} MarkFunction
 */

/**
 * @typedef {(item: any, itemEl: HTMLElement) => void} SelectFunction
 */

/**
 * @typedef {() => void} ClearFunction
 */

/**
 * @typedef {(item: any, itemEl: HTMLElement) => void} EnterFunction
 */

/**
 * Suggest settings object.
 *
 * ```
 * default = {
 *   placeholder: '',
 *   template: {
 *     listEl: '<div class="suggest-menu"></div>',
 *     itemEl: '<button type="button" class="suggest-item"></button>',
 *     errorEl: '<div class="suggest-error"></div>'
 *   },
 *   minLength: 1,
 *   debounce: 250,
 *   spinner: 'oval',
 *   searchFn: undefined,
 *   labelFn: item => item,
 *   markFn: (query, label) => label,
 *   selectFn: () => {},
 *   clearFn: () => {},
 *   enterFn: undefined
 * }
 * ```
 *
 * @typedef {Object} SuggestSettings
 * @prop {string} [placeholder] - Placeholder to set on the input.
 * @prop {string} [template.listEl] - HTML template for the list.
 * @prop {string} [template.itemEl] - HTML template for list items.
 * @prop {string} [template.errorEl] - HTML template for errors.
 * @prop {number} [minLength] - Minimum length of the query before executing a search.
 * @prop {number} [debounce] - The debounce in milliseconds. {@link https://stackoverflow.com/a/44755058/8316986|stackoverflow.com - Debounce Explanation}
 * @prop {string} [spinner] - The spinner type. {@link https://idahostatepolice.github.io/CDN/site/spinner.html|Spinner Docs}
 * @prop {SearchFunction} searchFn - Function that takes a query `string` and returns and `Array` of results to display.
 * @prop {LabelFunction} [labelFn] - Function that takes one item from the `Array` returned from the `searchFn` and returns a `string` to use as the label.
 * @prop {MarkFunction} [markFn] - Function that takes the query string and label and returns an HTML string with the label marked using mark tags.
 * @prop {SelectFunction} [selectFn] - Function that is called when an item in the list is selected. Takes the item from the list and the element that represents it. No return is expected.
 * @prop {ClearFunction} [clearFn] - Function that is called when the input has been cleared.
 * @prop {EnterFunction} [enterFn] - Function that is called when the enter key is pressed and the menu is visible. Takes the item from the list and the element that represents it that is highlighted, selected or null in that order.
 */

/**
 * Class to initialize input elements with suggest.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/suggest.html|Suggest Docs}
 */
class Suggest {
  /**
   * The default settings for a Suggest.
   * @type {SuggestSettings}
   */
  static #defaultSettings = {
    placeholder: '',
    template: {
      listEl: '<div class="suggest-menu"></div>',
      itemEl: '<button type="button" class="suggest-item"></button>',
      errorEl: '<div class="suggest-error"></div>'
    },
    minLength: 1,
    debounce: 250,
    spinner: 'oval',
    searchFn: undefined,
    labelFn: item => item,
    markFn: (query, label) => label,
    selectFn: () => {},
    clearFn: () => {},
    enterFn: undefined
  };

  /**
   * All the initialized HTMLElements and their Suggest objects.
   * @type {Map<HTMLElement, Suggest>}
   */
  static #initializedEls = new Map();

  /**
   * Settings for this suggest.
   * @type {SuggestSettings}
   */
  #settings;

  /**
   * The text input this suggest is initialized on.
   * @type {HTMLInputElement}
   */
  #inputEl;

  #wrapperEl;

  /**
   * The list element created by this suggest.
   * @type {HTMLElement}
   */
  #listEl;

  /**
   * The spinner object created by this suggest.
   * @type {Spinner}
   */
  #spinner;

  /**
   * The placeholder that was on `#inputEl`.
   * @type {{placeholder: string, style: string, autocomplete: string}}
   */
  #originalAttributes;

  /**
   * The timeout ID used as part of implementing debounce.
   * @type {number}
   * @see {@link https://stackoverflow.com/a/44755058/8316986|stackoverflow.com - Debounce Explanation}
   */
  #timeoutId;

  /**
   * Constructs a new Suggest object.
   *
   * @param {string | HTMLElement} el - A string selector or a DOM element.
   * @param {SuggestSettings} [options] - A SuggestSettings object.
   *
   * @see {@link https://idahostatepolice.github.io/CDN/site/suggest.html|Suggest Docs}
   */
  constructor(el, options) {
    this.#inputEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (this.#inputEl === null) {
      console.error('Suggest Error: Suggest input element is null. First constructor parameter must be a query selector or DOM element to attach the suggest to.',);
      return;
    }

    if (Suggest.#initializedEls.has(this.#inputEl)) {
      Suggest.#initializedEls.get(this.#inputEl).destroy();
    }

    this.#settings = Object.assign({}, Suggest.#defaultSettings, options);

    if (typeof this.#settings.searchFn !== 'function') {
      console.error('Suggest Error: You must define a search function.', this.#settings.searchFn);
      return;
    }

    this.#wrapperEl = Suggest.#wrapInputEl(this);
    this.#listEl = Suggest.#buildListEl(this);
    this.#spinner = Suggest.#buildSpinner(this);

    this.#originalAttributes = {
      placeholder: this.#inputEl.getAttribute('placeholder'),
      style: this.#inputEl.getAttribute('style'),
      autocomplete: this.#inputEl.getAttribute('autocomplete')
    };

    this.#inputEl.placeholder = this.#settings.placeholder;
    this.#inputEl.autocomplete = 'off';
    this.#inputEl.style.zIndex = '0';

    if (Suggest.#initializedEls.size === 0) {
      document.addEventListener('click', Suggest.#documentOnClick);
    }
    Suggest.#initializedEls.set(this.#inputEl, this);
  }

  /**
   * Destroys all events and resets DOM elements for this instance of Suggest.
   */
  destroy() {
    this.#spinner.destroy();

    const parentEl = this.#inputEl.parentElement;
    parentEl.insertAdjacentElement('beforebegin', this.#inputEl);
    parentEl.remove();

    revertAttributes(this.#inputEl, 'placeholder', this.#originalAttributes.placeholder);
    revertAttributes(this.#inputEl, 'style', this.#originalAttributes.style);
    revertAttributes(this.#inputEl, 'autocomplete', this.#originalAttributes.autocomplete);

    Suggest.#initializedEls.delete(this.#inputEl);
    if (Suggest.#initializedEls.size === 0) {
      document.removeEventListener('click', Suggest.#documentOnClick);
    }

    function revertAttributes(inputEl, name, value) {
      if (value) {
        inputEl.setAttribute(name, value);
      }
      else {
        inputEl.removeAttribute(name);
      }
    }
  }

  /**
   * Shows the list if there are currently any items to show.
   */
  show() {
    if (this.#listEl.children.length === 0) {
      return;
    }

    this.#listEl.style.top = this.#inputEl.offsetTop + this.#inputEl.offsetHeight + 'px';
    this.#listEl.style.left = this.#inputEl.offsetLeft + 'px';
    this.#listEl.style.width = this.#inputEl.offsetWidth + 'px';
    this.#listEl.classList.add('show');
  }

  /**
   * Hides the list.
   */
  hide() {
    this.#listEl.classList.remove('show');
  }

  /**
   * Hides the list and clears all list items.
   */
  clear() {
    this.hide();
    this.#inputEl.value = '';
    this.#listEl.innerHTML = '';
    this.#settings.clearFn.call(this);
  }

  /**
   * Refresh this suggest (Rerun search function and rebuild suggest list).
   */
  async refresh() {
    if (this.#inputEl.value === '') {
      this.clear();
      this.#spinner.hide();
      return;
    }

    if (this.#inputEl.value.length < this.#settings.minLength) {
      return;
    }

    try {
      this.#spinner.show();
      const query = this.#inputEl.value;
      const list = await this.#settings.searchFn.call(this, query);

      if (this.#inputEl.value !== query) {
        return;
      }

      updateList(this, list);
      this.#spinner.hide();
    }
    catch (error) {
      showError(this, error);
      this.#spinner.hide();
    }

    function updateList(suggest, list) {
      const fragment = document.createDocumentFragment();

      for (const item of list) {
        const query = suggest.#inputEl.value;
        const label = suggest.#settings.labelFn.call(suggest, item);
        const itemEl = fragment.appendChild(newElement());
        itemEl.innerHTML = suggest.#settings.markFn.call(suggest, query, label, item);
        itemEl.title = label;
        itemEl.suggestItem = item;
        itemEl.addEventListener('mouseenter', onMouseenter);
      }

      if (fragment.children.length > 0) {
        suggest.#listEl.replaceChildren(fragment);
        suggest.show();
      }
      else {
        suggest.hide();
        suggest.#listEl.innerHTML = '';
      }

      function newElement() {
        const temp = document.createElement('template');
        temp.innerHTML = suggest.#settings.template.itemEl;
        return temp.content.firstElementChild;
      }

      function onMouseenter(e) {
        const childList = [...suggest.#listEl.children];
        const childEl = childList.filter(el => el.contains(e.target))[0];
        childList.forEach(el => el.classList.remove('hover'));
        childEl.classList.add('hover');
      }
    }

    function showError(suggest, error) {
      suggest.hide();
      suggest.#listEl.innerHTML = '';
      suggest.#listEl.insertAdjacentHTML('beforeend', suggest.#settings.template.errorEl);
      suggest.#listEl.lastElementChild.append(document.createTextNode(error.message));
      suggest.show();
      console.error(error, suggest.#inputEl);
    }
  }

  /**
   * Handles debounce when typing in the input.
   *
   * @see {@link https://stackoverflow.com/a/44755058/8316986|stackoverflow.com - Debounce Explanation}
   */
  #debounceRefresh() {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
    }

    this.#timeoutId = setTimeout(async() => {
      this.#timeoutId = undefined;
      await this.refresh.call(this);
    }, this.#settings.debounce);
  }

  /**
   * Handles `ArrowDown`, `ArrowUp`, `Enter`, and `Tab` keys from the onKeydown listener.
   * This function will delegate to other functions depending on if the list is shown and what key was pressed.
   *
   * @param {KeyboardEvent} e - A KeyboardEvent event from the onKeydown listener.
   */
  #handleKeyEvent(e) {
    if (!this.#listEl.classList.contains('show')) {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        this.show();
      }

      return;
    }

    if (e.key === 'ArrowDown') {
      this.#moveHover(e, 'nextElementSibling', 'firstElementChild');
    }
    else if (e.key === 'ArrowUp') {
      this.#moveHover(e, 'previousElementSibling', 'lastElementChild');
    }
    else if (['Enter', 'Tab'].includes(e.key)) {
      this.#findSelectedEl(e);
    }
  }

  /**
   * Handles `Enter` and `Tab` keys from the `#handleKeyEvent` handler.
   * If the `Enter` key is pressed and a `enterFn` has been provided, it will execute that function.
   * Otherwise, it selects either the focused, active, or first element in the list.
   *
   * @param {KeyboardEvent} e - A KeyboardEvent event from the onKeydown listener.
   */
  #findSelectedEl(e) {
    e.preventDefault();
    e.stopPropagation();

    const focusedEl = this.#listEl.querySelector('.hover');
    const activeEl = this.#listEl.querySelector('.active');
    const currentEl = focusedEl || activeEl;

    if (e.key === 'Enter' && this.#settings.enterFn) {
      this.#settings.enterFn.call(this, currentEl?.suggestItem, currentEl);
    }
    else {
      this.#select(currentEl || this.#listEl.firstElementChild);
    }
  }

  /**
   * Handles moving the hover class to the focused element in the list.
   * Will also scroll the list if needed.
   *
   * @param {KeyboardEvent} event - A KeyboardEvent event.
   * @param {'nextElementSibling', 'previousElementSibling'} currentProp - Which sibling to get if there is a currently focused list item.
   * @param {'firstElementChild', 'lastElementChild'} listProp - Which child element to get if there is not a currently focused list item.
   */
  #moveHover(event, currentProp, listProp) {
    event.stopPropagation();
    event.preventDefault();

    const focusedEl = this.#listEl.querySelector('.hover');
    const activeEl = this.#listEl.querySelector('.active');
    const currentEl = focusedEl || activeEl;
    const nextEl = currentEl ? currentEl[currentProp] || this.#listEl[listProp] : this.#listEl[listProp];

    currentEl?.classList.remove('hover');
    nextEl.classList.add('hover');

    const listRect = this.#listEl.getBoundingClientRect();
    const selectedRect = nextEl.getBoundingClientRect();

    if (listRect.bottom < selectedRect.bottom) {
      nextEl.scrollIntoView(false);
    }
    else if (listRect.top > selectedRect.top) {
      nextEl.scrollIntoView();
    }
  }

  /**
   * Does the job of 'selecting' the item in the list. Including executing the `selectFn`.
   *
   * @param {HTMLListItem} [itemEl] - One item from the list.
   */
  #select(itemEl) {
    if (itemEl && itemEl !== this.#listEl) {
      this.#inputEl.value = this.#settings.labelFn.call(this, itemEl.suggestItem);
      [...this.#listEl.children].forEach(el => el.classList.remove('active', 'hover'));
      itemEl.classList.add('active');
      this.hide();
      this.#settings.selectFn.call(this, itemEl.suggestItem, itemEl);
    }
  }

  static #wrapInputEl(suggest) {
    const html = `<div class="suggest"></div>`;
    suggest.#inputEl.insertAdjacentHTML('afterend', html);
    suggest.#inputEl.nextElementSibling.append(suggest.#inputEl);
    suggest.#inputEl.parentElement.addEventListener('input', () => suggest.#debounceRefresh());
    suggest.#inputEl.parentElement.addEventListener('focus', () => suggest.show());
    suggest.#inputEl.parentElement.addEventListener('click', () => suggest.#inputEl.value !== '' ? suggest.show() : suggest.hide());
    suggest.#inputEl.parentElement.addEventListener('keydown', e => suggest.#handleKeyEvent(e));
    return suggest.#inputEl.parentElement;
  }

  static #buildListEl(suggest) {
    suggest.#inputEl.insertAdjacentHTML('afterend', suggest.#settings.template.listEl);
    suggest.#inputEl.nextElementSibling.addEventListener('click', e => {
      e.stopPropagation();
      suggest.#select(e.target);
    });
    return suggest.#inputEl.nextElementSibling;
  }

  static #buildSpinner(suggest) {
    return new Spinner(suggest.#inputEl.parentElement, {
      type: suggest.#settings.spinner,
      classes: 'suggest-spinner',
      styles: 'visibility: hidden;'
    });
  }

  static #documentOnClick(e) {
    for (const suggest of Suggest.#initializedEls.values()) {
      if (!suggest.#inputEl.contains(e.target) && !suggest.#listEl.contains(e.target)) {
        [...suggest.#listEl.children].forEach(el => el.classList.remove('hover'));
        suggest.hide();
      }
    }
  }
}

/**
 * This object contains higher-order functions ({@link https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function#returning_a_function|see MDN})
 * that build functions for the required `searchFn` option of a Suggest.
 *
 * @type {{ajax: AjaxSearchFactoryFunction}}
 */
const search = {
  /**
   * Factory function to build a `searchFn` using the {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API|fetch API}.
   * Handles the most common errors when talking to a SpringBoot endpoint.
   *
   * @typedef {(buildUrlFn: URLFactory, loginUrlEndsWith: string) => SearchFunction} AjaxSearchFactoryFunction
   */
  ajax: function(buildUrlFn, loginUrlEndsWith = '/login') {
    return async function(query) {
      const encodedQuery = encodeURIComponent(query);
      const result = await fetch(buildUrlFn(encodedQuery));

      if (result.redirected && result.url.endsWith(loginUrlEndsWith)) {
        throw new Error('You have been logged out.');
      }
      if (result.redirected || !result.ok) {
        throw new Error('There was a problem with the server.');
      }

      const list = await result.json();

      if (!(list instanceof Array)) {
        throw new Error('There was a problem with the server.');
      }

      return list;
    }
  }
};

/**
 * This object contains commonly used {@link MarkFunction}s.
 *
 * @type {{startsWith: StartsWithMarkFunction, contains: ContainsMarkFunction}}
 */
const mark = {
  /**
   * Checks the beginning of the label for the query and highlights it using mark tags.
   *
   * @typedef {MarkFunction} StartsWithMarkFunction
   */
  startsWith: function(query, label) {
    const index = label.toLowerCase().indexOf(query.toLowerCase()) + query.length;
    return `<mark>${label.slice(0, index)}</mark>${label.slice(index)}`;
  },
  /**
   * Searches anywhere in the label for the query and highlights it using mark tags.
   *
   * @typedef {MarkFunction} ContainsMarkFunction
   */
  contains: function(query, label) {
    return label.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
  }
};

export { Suggest, search, mark };