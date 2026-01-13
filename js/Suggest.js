import { Spinner } from "./Spinner.js";

const search = {
  ajax: function(buildUrlFn) {
    return async function(query) {
      const encodedQuery = encodeURIComponent(query);
      const result = await fetch(buildUrlFn(encodedQuery));

      if (result.redirected && result.url.endsWith('/login')) {
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
}

const mark = {
  startsWith: function(query, label) {
    const index = label.toLowerCase().indexOf(query.toLowerCase()) + query.length;
    return `<mark>${label.slice(0, index)}</mark>${label.slice(index)}`;
  },
  contains: function(query, label) {
    return label.replace(new RegExp(query, 'gi'), '<mark>$&</mark>');
  }
};

class Suggest {
  static #defaultSettings = {
    placeholder: '',
    wrapperClass: 'position-relative',
    template: {
      listEl: '<div class="dropdown-menu overflow-x-auto" style="max-height: 20rem;"></div>',
      itemEl: '<div class="dropdown-item text-truncate" style="cursor: pointer;"></div>',
      errorEl: '<div class="dropdown-item-text bg-danger rounded mx-2"></div>'
    },
    minLength: 1,
    debounce: 250, //debounce explanation: https://stackoverflow.com/a/44755058/8316986
    spinner: 'oval',
    searchFn: undefined,
    labelFn: item => item,
    markFn: (query, label) => label,
    selectFn: () => {},
    clearFn: () => {},
    enterFn: Suggest.#defaultOnEnter
  };

  static #initializedEls = new Map();

  settings;
  inputEl;
  spinner;

  #oldPlaceholder;
  #timeout;

  constructor(el, options) {
    this.inputEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (this.inputEl === null) {
      console.error('Suggest Error: Suggest input element is null. First constructor parameter must be a query selector or DOM element to attach the suggest to.',);
      return;
    }

    if (Suggest.#initializedEls.has(this.inputEl)) {
      Suggest.#initializedEls.get(this.inputEl).destroy();
    }

    this.settings = Object.assign({}, Suggest.#defaultSettings, options);
    this.listEl = Suggest.#buildListEl(this);
    this.spinner = Suggest.#buildSpinnerEl(this);

    if (typeof this.settings.searchFn !== 'function') {
      console.error('Suggest Error: You must define a search function.', this.settings.searchFn);
      return;
    }

    this.#oldPlaceholder = this.inputEl.placeholder;
    this.inputEl.placeholder = this.settings.placeholder;
    this.inputEl.autocomplete = 'off';
    this.inputEl.style.zIndex = '0';
    this.inputEl.addEventListener('focus', Suggest.#inputOnFocus);
    this.inputEl.addEventListener('click', Suggest.#inputOnClick);
    this.inputEl.addEventListener('input', Suggest.#inputOnInput);
    this.inputEl.addEventListener('keydown', Suggest.#inputOnKeydown);
    if (Suggest.#initializedEls.size === 0) {
      document.addEventListener('click', Suggest.#documentOnClick);
    }
    Suggest.#initializedEls.set(this.inputEl, this);
  }

  destroy() {
    this.listEl.remove();
    this.spinner.destroy();
    this.inputEl.placeholder = this.#oldPlaceholder;
    this.inputEl.autocomplete = '';
    this.inputEl.style.zIndex = '';
    this.inputEl.removeEventListener('focus', Suggest.#inputOnFocus);
    this.inputEl.removeEventListener('click', Suggest.#inputOnClick);
    this.inputEl.removeEventListener('input', Suggest.#inputOnInput);
    this.inputEl.removeEventListener('keydown', Suggest.#inputOnKeydown);
    if (Suggest.#initializedEls.size === 1) {
      document.removeEventListener('click', Suggest.#documentOnClick);
    }
    Suggest.#initializedEls.delete(this.inputEl);
  }

  show() {
    if (this.listEl.children.length === 0) {
      return;
    }

    this.listEl.style.top = this.inputEl.offsetTop + this.inputEl.offsetHeight + 'px';
    this.listEl.style.left = this.inputEl.offsetLeft + 'px';
    this.listEl.style.width = this.inputEl.offsetWidth + 'px';
    this.listEl.classList.add('show');
  }

  hide() {
    this.listEl.classList.remove('show');
  }

  clear() {
    this.hide();
    this.inputEl.value = '';
    this.listEl.innerHTML = '';
    this.settings.clearFn.call(this);
  }

  async refresh() {
    if (this.inputEl.value === '') {
      this.clear();
      this.spinner.hide();
      return;
    }

    if (this.inputEl.value.length < this.settings.minLength) {
      return;
    }

    try {
      showSvg(this);
      const query = this.inputEl.value;
      const list = await this.settings.searchFn.call(this, query);

      if (this.inputEl.value !== query) {
        return;
      }

      updateList(this, list);
      this.spinner.hide();
    }
    catch (error) {
      showError(this, error);
      this.spinner.hide();
    }

    function showSvg(suggest) {
      suggest.spinner.svgEl.style.maxWidth = (suggest.inputEl.offsetHeight - 8) + 'px';
      suggest.spinner.svgEl.style.height = (suggest.inputEl.offsetHeight - 8) + 'px';
      suggest.spinner.svgEl.style.top = (suggest.inputEl.offsetTop + 4) + 'px';
      suggest.spinner.svgEl.style.left = (calcLeft(suggest) - 4) + 'px';
      suggest.spinner.show();

      function calcLeft(suggest) {
        const rightSide = suggest.inputEl.offsetLeft + suggest.inputEl.offsetWidth;
        const width = suggest.spinner.svgEl.getBoundingClientRect().width;
        return rightSide - width;
      }
    }

    function updateList(suggest, list) {
      const fragment = document.createDocumentFragment();

      for (const item of list) {
        const query = suggest.inputEl.value;
        const label = suggest.settings.labelFn.call(suggest, item);
        const itemEl = fragment.appendChild(newElement());
        itemEl.innerHTML = suggest.settings.markFn.call(suggest, query, label, item);
        itemEl.title = label;
        itemEl.suggestItem = item;
        itemEl.addEventListener('mouseenter', onMouseenter);
      }

      if (fragment.children.length > 0) {
        suggest.listEl.replaceChildren(fragment);
        suggest.show();
      }
      else {
        suggest.hide();
        suggest.listEl.innerHTML = '';
      }

      function newElement() {
        const temp = document.createElement('template');
        temp.innerHTML = suggest.settings.template.itemEl;
        return temp.content.firstElementChild;
      }

      function onMouseenter(e) {
        const childList = [...suggest.listEl.children];
        const childEl = childList.filter(el => el.contains(e.target))[0];
        childList.forEach(el => el.classList.remove('hover'));
        childEl.classList.add('hover');
      }
    }

    function showError(suggest, error) {
      suggest.hide();
      suggest.listEl.innerHTML = '';
      suggest.listEl.insertAdjacentHTML('beforeend', suggest.settings.template.errorEl);
      suggest.listEl.lastElementChild.append(document.createTextNode(error.message));
      suggest.show();
      console.error(error, suggest.inputEl);
    }
  }

  #select(itemEl) {
    if (itemEl) {
      this.inputEl.value = this.settings.labelFn.call(this, itemEl.suggestItem);
      [...this.listEl.children].forEach(el => el.classList.remove('active', 'hover'));
      itemEl.classList.add('active');
      this.hide();
      this.settings.selectFn.call(this, itemEl.suggestItem, itemEl);
    }
  }

  static #buildListEl(suggest) {
    if (needsWrapperEl(suggest.inputEl)) {
      wrapInputEl(suggest.inputEl, suggest.settings.wrapperClass);
    }

    suggest.inputEl.insertAdjacentHTML('afterend', suggest.settings.template.listEl);
    const listEl = suggest.inputEl.nextElementSibling;
    listEl.addEventListener('click', onClick);
    return listEl;

    function needsWrapperEl(el) {
      return window.getComputedStyle(el.parentElement)['position'] !== 'relative';
    }

    function wrapInputEl(el, wrapperClass) {
      const classProp = Suggest.#getPropText('class', wrapperClass);
      el.insertAdjacentHTML('afterend', `<div${classProp}></div>`);
      el.nextElementSibling.append(el);
    }

    function onClick(e) {
      if (e.target !== suggest.listEl) {
        suggest.#select(e.target);
      }
    }
  }

  static #buildSpinnerEl(suggest) {
    const spinner = new Spinner(suggest.settings.spinner, {
      styles: 'position: absolute; visibility: hidden; z-index: 1;'
    });

    suggest.inputEl.insertAdjacentElement('afterend', spinner.svgEl);
    return spinner;
  }

  static #inputOnFocus(e) {
    const suggest = Suggest.#findSuggest(e.target);
    if (suggest.listEl.children.length > 0) {
      suggest.show();
    }
  }

  static #inputOnClick(e) {
    const suggest = Suggest.#findSuggest(e.target);
    suggest.inputEl.value !== '' ? suggest.show() : suggest.hide();
  }

  static #inputOnInput(e) {
    const suggest = Suggest.#findSuggest(e.target);

    if (suggest.#timeout) {
      clearTimeout(suggest.#timeout);
    }

    suggest.#timeout = setTimeout(async function() {
      suggest.#timeout = undefined;
      await suggest.refresh.call(suggest);
    }, suggest.settings.debounce);
  }

  static #inputOnKeydown(e) {
    const suggest = Suggest.#findSuggest(e.target);
    const keyFunctions = {
      ArrowDown: function(currentEl) {
        move(currentEl, getNextOrFirstEl(currentEl));
      },
      ArrowUp: function(currentEl) {
        move(currentEl, getPreviousOrLastEl(currentEl));
      },
      Enter: function(currentEl) {
        suggest.settings.enterFn.call(suggest, currentEl?.suggestItem, currentEl);
      },
      Tab: function(currentEl) {
        suggest.#select(currentEl || suggest.listEl.firstElementChild);
      }
    };

    if (suggest.listEl.classList.contains('show')) {
      if (keyFunctions[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        const hoverEl = suggest.listEl.querySelector('.hover');
        const activeEl = suggest.listEl.querySelector('.active');
        keyFunctions[e.key](hoverEl || activeEl);
      }
    }

    function getNextOrFirstEl(prevEl) {
      if (prevEl && prevEl.nextElementSibling) {
        return prevEl.nextElementSibling;
      }
      return suggest.listEl.firstElementChild;
    }

    function getPreviousOrLastEl(prevEl) {
      if (prevEl && prevEl.previousElementSibling) {
        return prevEl.previousElementSibling;
      }
      return suggest.listEl.lastElementChild;
    }

    function move(prevEl, nextEl) {
      if (prevEl) {
        prevEl.classList.remove('hover');
      }
      nextEl.classList.add('hover');

      const listRect = suggest.listEl.getBoundingClientRect();
      const selectedRect = nextEl.getBoundingClientRect();

      if (listRect.bottom < selectedRect.bottom) {
        nextEl.scrollIntoView(false);
      }
      else if (listRect.top > selectedRect.top) {
        nextEl.scrollIntoView();
      }
    }
  }

  static #defaultOnEnter(currentItem, currentEl) {
    // noinspection JSUnresolvedReference
    this.#select(currentEl || this.listEl.firstElementChild);
  }

  static #documentOnClick(e) {
    for (const suggest of Suggest.#initializedEls.values()) {
      if (!suggest.inputEl.contains(e.target) && !suggest.listEl.contains(e.target)) {
        [...suggest.listEl.children].forEach(el => el.classList.remove('hover'));
        suggest.hide();
      }
    }
  }

  static #findSuggest(el) {
    let suggestEl = el;

    while (suggestEl && !Suggest.#initializedEls.has(suggestEl)) {
      suggestEl = suggestEl.parentElement;
    }

    if (suggestEl) {
      return Suggest.#initializedEls.get(suggestEl);
    }

    throw new Error('Suggest Error: Could not find Suggest object.');
  }

  static #getPropText(name, value) {
    if (value && value !== '') {
      return ` ${name}="${value}"`;
    }
    return '';
  }
}

export { Suggest, search, mark };