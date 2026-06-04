/**
 * Global settings that affect all List Items.
 *
 * ```
 * defaults = {
 *   transitionTime: .35,
 *   addItemSelector: '[data-isp-toggle="add-item"]',
 *   removeItemSelector: '[data-isp-toggle="remove-item"]',
 *   deleteInputSelector: '[data-delete-input]',
 *   deleteInputValueOnDelete: 'true',
 *   countSelector: '[data-item-count]'
 * }
 * ```
 *
 * @typedef {Object} ListItemSettings
 * @prop {number} [transitionTime] - The time it takes in seconds to add or remove an item.
 * @prop {string} [addItemSelector] - Selector used to find add buttons.
 * @prop {string} [removeItemSelector] - Selector used to find remove buttons.
 * @prop {string} [deleteInputSelector] - Selector used to find the delete input in the list item.
 * @prop {string} [deleteInputValueOnDelete] - Value to put in the delete input.
 * @prop {string} [countSelector] - Selector used to find item count spans in the list item.
 */

/**
 * Default ListItemSettings
 * @type {ListItemSettings}
 */
const defaultSettings = {
  transitionTime: .35,
  transitionCssClass: 'transitioning',
  addItemSelector: '[data-isp-toggle="add-item"]',
  removeItemSelector: '[data-isp-toggle="remove-item"]',
  deleteInputSelector: '[data-delete-input]',
  deleteInputValueOnDelete: 'true',
  countSelector: '[data-item-count]'
}

/**
 * Objects saved so they can be removed during initialization.
 */
let settings, onClickListener, styleEl, transparentEl;

/**
 * Initializes the adding and removing of list items from lists.
 *
 * @param {ListItemSettings} [options] - Settings to check the behavior on all lists.
 *
 * @see {@link https://idahostatepolice.github.io/CDN/site/init-list-items.html|Init List Items Docs}
 */
function initListItems(options) {
  settings = Object.assign({}, defaultSettings, options);
  cleanOldInit();
  addClickListener();
  addTransitioningStyleEl();
  addTransparentEl();

  /**
   * Function that checks references of an old initialization and removes them if needed.
   */
  function cleanOldInit() {
    if (onClickListener) {
      document.removeEventListener('click', onClickListener);
    }
    if (styleEl) {
      styleEl.remove();
    }
    if (transparentEl) {
      transparentEl.remove();
    }
  }

  /**
   * Function that adds a new click listener and saves a reference of it.
   */
  function addClickListener() {
    onClickListener = function(e) {
      addItem(e.target.closest(settings.addItemSelector));
      removeItem(e.target.closest(settings.removeItemSelector));
    };

    document.addEventListener('click', onClickListener);
  }

  /**
   * Function that adds the transitioning CSS class to animate add and remove of items.
   */
  function addTransitioningStyleEl() {
    const html = `<style> .${settings.transitionCssClass} { overflow: hidden; transition: all ${settings.transitionTime}s ease; } </style>`;
    document.head.insertAdjacentHTML('beforeend', html);
    styleEl = document.head.lastElementChild;
  }

  /**
   * Function that adds a div with opacity of 0 to the bottom of the page.
   * This is used to measure the height and width of hidden elements for the animation.
   */
  function addTransparentEl() {
    document.body.insertAdjacentHTML('beforeend', '<div style="opacity: 0;"></div>');
    transparentEl = document.body.lastElementChild;
  }
}

/**
 * Adds a new item to the list.
 */
function addItem(addBtn) {
  if (addBtn) {
    const templateEl = document.querySelector(addBtn.dataset.template);
    const listEl = document.querySelector(addBtn.dataset.list);
    const indexVar = templateEl.dataset.indexVar || '{index}';
    const insertLocation = templateEl.dataset.insertLocation || 'bottom';

    addIndexAndCountIfNeeded(listEl);
    const index = listEl.dataset.index;
    // update index now in case user makes multiple clicks on add.
    listEl.dataset.index = (Number(index) + 1).toString();

    const template = templateEl.innerHTML.replaceAll(new RegExp(indexVar, 'g'), index);
    const wrappedTemplate = `<div class="${settings.transitionCssClass}" style="height: 0; opacity: 0;">${template}</div>`;
    const wrappedItemEl = insertTemplate(listEl, insertLocation, wrappedTemplate);

    initializeJavaScriptTags(wrappedItemEl);
    setTempStyle(listEl, wrappedItemEl.firstElementChild);

    updateCount(listEl, 1);
    wrappedItemEl.style.height = wrappedItemEl.firstElementChild.scrollHeight + 'px';
    wrappedItemEl.style.opacity = '1';

    afterTransition(() => {
      const itemEl = wrappedItemEl.firstElementChild;
      wrappedItemEl.replaceWith(itemEl);
      removeTempStyle(itemEl);
      listEl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    function insertTemplate(target, position, string) {
      if (position === 'top') {
        target.insertAdjacentHTML('afterbegin', string);
        return target.firstElementChild;
      }
      if (position === 'bottom') {
        target.insertAdjacentHTML('beforeend', string);
        return target.lastElementChild;
      }
    }

    function initializeJavaScriptTags(target) {
      for (const scriptEl of target.querySelectorAll('script')) {
        const newScriptEl = document.createElement('script');
        newScriptEl.textContent = scriptEl.innerText;
        scriptEl.parentNode.insertBefore(newScriptEl, scriptEl);
        scriptEl.remove();
      }
    }
  }
}

function removeItem(removeBtn) {
  if (removeBtn) {
    const itemEl = removeBtn.closest(removeBtn.dataset.parent);
    const listEl = itemEl.parentElement;
    const deletedEl = itemEl.querySelector(settings.deleteInputSelector);
    const template = `<div class="${settings.transitionCssClass}" style="height: ${itemEl.scrollHeight + 'px'}; opacity: 1;"></div>`;

    addIndexAndCountIfNeeded(listEl);
    setTempStyle(listEl, itemEl);

    itemEl.insertAdjacentHTML('beforebegin', template);
    const wrapperEl = itemEl.previousElementSibling;
    wrapperEl.appendChild(itemEl);

    // added a 5 ms timeout to allow the browser enough
    // time to realize there is a class on the element.
    setTimeout(function() {
      wrapperEl.style.height = '0';
      wrapperEl.style.opacity = '0';

      afterTransition(() => {
        if (deletedEl) {
          removeTempStyle(itemEl);
          itemEl.style = 'display: none !important';
          wrapperEl.replaceWith(itemEl);
          deletedEl.value = settings.deleteInputValueOnDelete;
        }
        else {
          wrapperEl.remove();
        }

        updateCount(listEl, -1);
        listEl.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }, 5);
  }
}

function addIndexAndCountIfNeeded(listEl) {
  if (!listEl.dataset.index) {
    listEl.dataset.index = listEl.children.length.toString();
  }

  if (!listEl.dataset.count) {
    listEl.dataset.count = listEl.dataset.index;
  }
}

function setTempStyle(listEl, itemEl) {
  const listElClone = listEl.cloneNode(false);
  const itemElClone = itemEl.cloneNode(false);

  listElClone.removeAttribute('id');
  listElClone.append(itemElClone);
  transparentEl.append(listElClone);

  const cloneStyle = getComputedStyle(itemElClone);

  itemEl.ispOriginalStyle = itemEl.getAttribute('style');
  for (const prop of cloneStyle) {
    if (prop.startsWith('padding') || prop.startsWith('margin')) {
      itemEl.style.setProperty(prop, cloneStyle.getPropertyValue(prop));
    }
  }

  transparentEl.innerHTML = '';
}

function removeTempStyle(itemEl) {
  if (itemEl.ispOriginalStyle) {
    itemEl.setAttribute('style', itemEl.ispOriginalStyle);
  }
  else {
    itemEl.removeAttribute('style');
  }
  delete itemEl.ispOriginalStyle;
}

function afterTransition(fn) {
  // transition time in milliseconds + 5 millisecond padding
  setTimeout(fn, settings.transitionTime * 1000 + 5);
}

function updateCount(listEl, increment) {
  const count = (Number(listEl.dataset.count) + increment).toString();
  listEl.dataset.count = count;

  // update total counts
  const totalEls = document.querySelectorAll(listEl.dataset.totalTarget);
  totalEls.forEach(el => el.innerHTML = count);

  // update individual counts
  const visibleEls = [...listEl.children].filter(el => {
    const countEls = el.querySelectorAll(settings.countSelector);
    return el.checkVisibility() && countEls.length > 0;
  });

  visibleEls.forEach((itemEl, i) => {
    const count = (visibleEls.length.toString() === count) ? (i + 1).toString() : '';
    itemEl.querySelectorAll(settings.countSelector).forEach(el => el.innerHTML = count);
  });
}

export { initListItems }