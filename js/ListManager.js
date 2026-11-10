import { resolveSettings } from "./utils.js";

/**
 * Settings used to configure a ListManager.
 *
 * These settings may be supplied via:
 *
 * - Component defaults
 * - Root element data attributes
 * - Constructor options
 *
 * Precedence:
 *
 * defaults < data attributes < constructor options
 *
 * ```
 * defaults = {
 *   listTransitionTime: .25,
 *   listIndexing: 'contiguous',
 *   listIndexPlaceholder: '{index}',
 *   listSelector: '[data-list]',
 *   listInsertion: 'bottom',
 *   listAddSelector: '[data-list-add]',
 *   listRemoveSelector: '[data-list-remove]',
 *   listCountSelector: '[data-list-count]',
 *   listItemNumberSelector: '[data-list-item-number]',
 *   listFlagDeleteSelector: '[data-list-flag-delete]'
 * }
 * ```
 *
 * @typedef {Object} ListManagerSettings
 * @prop {number} listTransitionTime - Duration of add/remove animations in seconds.
 * @prop {'contiguous'|'sparse'} listIndexing - Determines whether index values are reordered sequentially after a remove (contiguous) or if gaps are allowed (sparse).
 * @prop {string} listIndexPlaceholder - Placeholder text replaced with the next item index when cloning template content.
 * @prop {string} listSelector - Selector used to locate the list container within the root element.
 * @prop {'top'|'bottom'} listInsertion - Where newly added items are inserted into the list.
 * @prop {string} listAddSelector - Selector used to locate add buttons within the root element.
 * @prop {string} listRemoveSelector - Selector used to locate remove buttons within the root element.
 * @prop {string} listCountSelector - Selector used to locate elements that display the total visible item count.
 * @prop {string} listItemNumberSelector - Selector used to locate elements that display an individual item's visible position.
 * @prop {string} listFlagDeleteSelector - Selector used to locate hidden inputs that should be set when an item is soft-deleted.
 */

/**
 * Decorates a root element to manage a dynamic list of items.
 *
 * ListManager adds, removes, animates, and optionally soft-deletes items
 * using a single server-rendered <template> as the source of truth.
 *
 * Features:
 *
 * - Add new items from a template
 * - Remove items with animated transitions
 * - Flags delete on persisted items
 * - Automatic list and item counting
 * - Event delegation
 * - Nested ListManager support
 *
 * A ListManager manages descendants whose nearest ListManager root ancestor is itself. This allows ListManagers to be safely nested.
 *
 * Required structure:
 *
 * ```html
 * <div data-isp-toggle="list-manager">
 *
 *   <button type="button" data-list-add>
 *     Add Child
 *   </button>
 *
 *   Count:
 *   <span data-list-count></span>
 *
 *   <div data-list>
 *     <!-- existing items -->
 *   </div>
 *
 *   <template>
 *     <!-- item markup -->
 *   </template>
 *
 * </div>
 * ```
 *
 * Example:
 *
 * ```javascript
 * new ListManager(document.querySelector('[data-isp-toggle="list-manager"]'));
 * ```
 *
 * Optional item attributes:
 *
 * - `data-list-remove` - Removes the containing item
 * - `data-list-flag-delete` - Hidden input updated to "true" when removed
 * - `data-list-count` - Displays the total list count
 * - `data-list-item-number` - Displays the visible item number
 *
 * Root configuration may be supplied via constructor options or data attributes.
 *
 * Precedence:
 *
 * defaults < constructor options < data attributes
 *
 * @example
 * new ListManager('#my-list', {
 *   listTransitionTime: .5
 * });
 */
class ListManager {

  /**
   * The selector used to find elements to enhance with this component.
   * @type {string}
   */
  static #COMPONENT_SELECTOR = '[data-isp-toggle="list-manager"]';

  /**
   * The default selector identifying elements this component should be attached to.
   * Read-only; consumed by whatever helper performs construction (e.g. initAll).
   * @type {string}
   */
  static get SELECTOR() {
    return ListManager.#COMPONENT_SELECTOR;
  }

  /**
   * Immutable default configuration used by all ListManager instances.
   * Precedence: defaults < root data attributes < constructor options
   * @type {Readonly<ListManagerSettings>}
   */
  static #DEFAULTS = Object.freeze({
    listTransitionTime: .25,
    listIndexing: 'contiguous',
    listIndexPlaceholder: '{index}',
    listSelector: '[data-list]',
    listInsertion: 'bottom',
    listAddSelector: '[data-list-add]',
    listRemoveSelector: '[data-list-remove]',
    listCountSelector: '[data-list-count]',
    listItemNumberSelector: '[data-list-item-number]',
    listFlagDeleteSelector: '[data-list-flag-delete]',
  });

  /**
   * All the initialized HTMLElements and their ListManager objects.
   * @type {WeakMap<HTMLElement, ListManager>}
   */
  static #INSTANCES = new WeakMap();

  /**
   * Responsible for enter and exit animations. Encapsulates all animation behavior away from ListManager.
   * @type {Animator}
   */
  #animator;

  /**
   * Root element decorated by this ListManager instance.
   * @type {HTMLElement}
   */
  #rootEl;

  /**
   * Container that directly owns all list items.
   * @type {HTMLElement}
   */
  #listEl;

  /**
   * Template used as the single source of truth for new items. Must contain exactly one root element.
   * @type {HTMLTemplateElement}
   */
  #templateEl;

  /**
   * @type {ListManagerSettings}
   */
  #settings;

  /**
   * Monotonically increasing index used when replacing the configured index placeholder in template content.
   * This value is intentionally never decremented to preserve stable form field names across add/remove operations.
   * @type {number}
   */
  #nextIndex;

  /**
   * Tracks items whose indexes may be reassigned. Persisted items retain stable indexes; dynamically added items may be
   * renumbered when contiguous indexing is enabled.
   * @type {WeakSet<HTMLElement>}
   */
  #dynamicItems = new WeakSet();

  constructor(el, options = {}) {
    this.#rootEl = typeof el === 'string' ? document.querySelector(el) : el;

    if (!(this.#rootEl instanceof HTMLElement)) {
      throw new Error(`ListManager could not find root element: ${el}`);
    }

    if (ListManager.#INSTANCES.has(this.#rootEl)) {
      ListManager.#INSTANCES.get(this.#rootEl).destroy();
    }
    ListManager.#INSTANCES.set(this.#rootEl, this);

    this.#settings = Object.freeze(resolveSettings(ListManager.#DEFAULTS, options, this.#rootEl));

    this.#listEl = this.#queryOwned(this.#settings.listSelector);
    if (!this.#listEl) {
      throw new Error(`ListManager expects an element with list selector ${this.#settings.listSelector} but not found in root element. \n\n ${this.#rootEl.outerHTML}`);
    }

    this.#templateEl = this.#queryOwned('template');
    if (!this.#templateEl) {
      throw new Error(`ListManager expects a <template> but none found in root element. \n\n ${this.#rootEl.outerHTML}`);
    }

    if (this.#templateEl.content.children.length !== 1) {
      throw new Error(`ListManager expects a <template> containing only one root element (found ${this.#templateEl.content.children.length}).\n\n ${this.#rootEl.outerHTML}`);
    }

    this.#rootEl.addEventListener('click', this.#onClick);
    this.#nextIndex = this.#allItems().length;
    this.#animator = new Animator(this.#settings.listTransitionTime);
    this.refresh();
  }

  /**
   * Adds a new item to the list from the configured template. The item's index placeholder is replaced with the next
   * available index before being inserted and animated.
   *
   * @returns {HTMLElement} The newly added item element.
   */
  add() {
    const item = this.#createItem();
    this.#initializeItem(item, this.#nextIndex++);
    this.#animator.enter(item, this.#listEl, this.#settings.listInsertion, () => {
      this.refresh();
      this.#dispatchChange();
    });

    return item;
  }

  /**
   * Removes an item from the list. Persisted items are soft-deleted when configured; otherwise the item is removed from the DOM.
   *
   * @param {HTMLElement} item - The item to remove.
   */
  remove(item) {
    if (!item) {
      return;
    }

    this.#animator.exit(item, () => {
      if (this.#hasSoftDeleteFlag(item)) {
        this.#softDelete(item);
      }
      else {
        item.remove();
      }

      this.refresh();
      this.#dispatchChange();
    });
  }

  /**
   * Refreshes all derived list state. Updates visible item counts and item numbering.
   */
  refresh() {
    this.#updateIndexes();
    this.#updatePresentation();
  }

  /**
   * Returns the number of visible items in the list.
   *
   * @returns {number} The visible item count.
   */
  count() {
    return this.#visibleItems().length;
  }

  /**
   * Returns all visible items in the list.
   *
   * @returns {HTMLElement[]} The visible item elements.
   */
  items() {
    return this.#visibleItems();
  }

  /**
   * @param {HTMLElement} el
   * @returns {ListManager | undefined} The instance attached to the element, if any.
   */
  static for(el) {
    return ListManager.#INSTANCES.get(el);
  }

  /**
   * Destroys this ListManager instance. Removes event listeners and unregisters the instance.
   */
  destroy() {
    this.#rootEl?.removeEventListener('click', this.#onClick);
    ListManager.#INSTANCES.delete(this.#rootEl);
  }

  #onClick = e => {
    if (this.#nearestListManager(e.target) !== this) {
      return;
    }

    const addBtn = e.target.closest(this.#settings.listAddSelector);
    if (addBtn) {
      e.preventDefault();
      this.add();
      return;
    }

    const removeBtn = e.target.closest(this.#settings.listRemoveSelector);
    if (removeBtn) {
      e.preventDefault();
      const item = this.#findItem(removeBtn);
      if (item && this.#listEl.contains(item)) {
        this.remove(item);
      }
    }
  }

  #createItem() {
    return this.#templateEl.content.firstElementChild.cloneNode(true);
  }

  #initializeItem(item, index) {
    this.#captureNamePatterns(item);
    this.#applyIndex(item, index);
    this.#dynamicItems.add(item);
    this.#initializeScripts(item);
  }

  #captureNamePatterns(item) {
    item.querySelectorAll("[name]").forEach(input => {
      this.#captureNamePattern(input);
    });

    item.querySelectorAll("template").forEach(template => {
      template.content.querySelectorAll("[name]").forEach(input => {
        this.#captureNamePattern(input);
      });
    });
  }

  #captureNamePattern(input) {
    if (!input.dataset.listNamePattern) {
      input.dataset.listNamePattern = input.name;
    }

    if (!input.dataset.listNameIndexes) {
      input.dataset.listNameIndexes = "{}";
    }
  }

  #applyIndex(item, index) {
    this.#replaceIndexes(item, index);
    for (const template of item.querySelectorAll("template")) {
      this.#replaceIndexes(template.content, index);
    }
  }

  #replaceIndexes(root, index) {
    root.querySelectorAll("[name]").forEach(input => {
      this.#captureNamePattern(input);

      const indexes = this.#readNameIndexes(input);
      indexes[this.#settings.listIndexPlaceholder] = index.toString();

      input.dataset.listNameIndexes = JSON.stringify(indexes);
      input.name = this.#renderNamePattern(input.dataset.listNamePattern, indexes);
    });
  }

  #readNameIndexes(input) {
    try {
      return JSON.parse(input.dataset.listNameIndexes || "{}");
    }
    catch {
      return {};
    }
  }

  #renderNamePattern(pattern, indexes) {
    let rendered = pattern;
    for (const placeholder of Object.keys(indexes)) {
      rendered = rendered.replaceAll(placeholder, indexes[placeholder]);
    }

    return rendered;
  }

  #updateIndexes() {
    if (this.#settings.listIndexing !== "contiguous") {
      return;
    }

    const dynamicItems = this.#allItems().filter(item => this.#dynamicItems.has(item));

    if (this.#settings.listInsertion === "top") {
      dynamicItems.reverse();
    }

    let index = this.#allItems().length - dynamicItems.length;
    for (const item of dynamicItems) {
      this.#applyIndex(item, index++);
    }

    this.#nextIndex = index;
  }

  #updatePresentation() {
    const visible = this.#visibleItems();
    this.#updateListCount(visible);
    this.#updateItemNumbers(visible);
  }

  #updateListCount(visibleItems) {
    const count = visibleItems.length;
    this.#queryAllOwned(this.#settings.listCountSelector).forEach(el => el.textContent = count);
  }

  #updateItemNumbers(visibleItems) {
    visibleItems.forEach((item, i) => item.querySelectorAll(this.#settings.listItemNumberSelector).forEach(el => el.textContent = i + 1));
  }

  #hasSoftDeleteFlag(item) {
    return item.querySelectorAll(this.#settings.listFlagDeleteSelector).length > 0;
  }

  #softDelete(item) {
    item.hidden = true;
    item.style.setProperty('display', 'none', 'important');
    item.querySelectorAll(this.#settings.listFlagDeleteSelector).forEach(el => el.value = 'true');
  }

  #visibleItems() {
    return [...this.#listEl.children].filter(el => !el.hidden);
  }

  #allItems() {
    return [...this.#listEl.children];
  }

  #findItem(el) {
    let node = el;

    while (node) {
      if (this.#nearestListManager(node) !== this) {
        return null;
      }

      if (node.parentElement === this.#listEl) {
        return node;
      }

      node = node.parentElement;
    }

    return null;
  }

  #dispatchChange() {
    this.#rootEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #initializeScripts(root) {
    root.querySelectorAll('script').forEach(oldScript => {
      const script = document.createElement('script');
      script.textContent = oldScript.textContent;
      oldScript.replaceWith(script);
    });
  }

  #queryAllOwned(selector) {
    return [...this.#rootEl.querySelectorAll(selector)].filter(el => this.#isMine(el));
  }

  #queryOwned(selector) {
    return this.#queryAllOwned(selector)[0];
  }

  #isMine(el) {
    return this.#nearestListManager(el) === this;
  }

  /**
   * Returns the nearest owning ListManager instance for an element.
   * Ownership is determined by walking ancestor elements until a registered ListManager root is found.
   */
  #nearestListManager(el) {
    let node = el;
    while (node) {
      const instance = ListManager.#INSTANCES.get(node);
      if (instance) {
        return instance;
      }
      node = node.parentElement;
    }

    return null;
  }
}

class Animator {
  #transitionTime;

  constructor(transitionTime) {
    this.#transitionTime = transitionTime;
  }

  enter(item, container, position, done) {
    const wrapper = this.#createWrapper();
    wrapper.style.height = '0';
    wrapper.style.opacity = '0';
    wrapper.append(item);

    if (position === 'top') {
      container.prepend(wrapper);
    }
    else {
      container.append(wrapper);
    }

    this.#preserveSpacing(item);
    this.#animate(wrapper, { height: item.scrollHeight + 'px', opacity: '1' }, () => {
      this.#restoreSpacing(item);
      wrapper.replaceWith(item);
      done();
    });
  }

  exit(item, done) {
    this.#preserveSpacing(item);

    const wrapper = this.#wrap(item);
    wrapper.style.height = item.scrollHeight + 'px';
    wrapper.style.opacity = '1';

    this.#animate(wrapper, { height: '0', opacity: '0' }, () => {
      this.#restoreSpacing(item);
      wrapper.replaceWith(item);
      done();
    });
  }

  #createWrapper() {
    const wrapper = document.createElement('div');

    Object.assign(
      wrapper.style, {
        overflow: 'hidden',
        transition: `
          height ${this.#transitionTime}s ease,
          opacity ${this.#transitionTime}s ease
        `
      }
    );

    return wrapper;
  }

  #preserveSpacing(item) {
    item.originalStyle = item.getAttribute('style');

    const style = getComputedStyle(item);
    for (const prop of style) {
      if (prop.startsWith('padding') || prop.startsWith('margin')) {
        item.style.setProperty(prop, style.getPropertyValue(prop));
      }
    }
  }

  #restoreSpacing(item) {
    if (item.originalStyle) {
      item.setAttribute('style', item.originalStyle);
    }
    else {
      item.removeAttribute('style');
    }

    delete item.originalStyle;
  }

  #wrap(item) {
    const wrapper = this.#createWrapper();
    item.before(wrapper);
    wrapper.append(item);
    return wrapper;
  }

  #animate(wrapper, styles, done) {
    this.#nextPaint(() => {
      Object.assign(wrapper.style, styles);
      this.#afterTransition(done);
    });
  }

  #nextPaint(fn) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }

  #afterTransition(fn) {
    setTimeout(fn, this.#transitionTime * 1000 + 5);
  }
}

export { ListManager };