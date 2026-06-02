/**
 * DropdownSelect settings object to configure a new DropdownSelect object.
 *
 * ```
 * defaults = {
 *   summarizeMultiple: false,
 *   showFilter: false,
 *   filterBehavior: 'only-hidden',
 *   showClearButton: false,
 *   showSelectAllButton: false
 * }
 * ```
 *
 * @typedef {Object} DropdownSelectSettings
 * @prop {boolean} summarizeMultiple - When true, if multiple options are selected the count of selected options is shown. Otherwise, the labels of the selected options are shown if space allows.
 * @prop {boolean} showFilter - Show an input the user can use to filter select options displayed.
 * @prop {string} [filterBehavior] - Either 'only-hidden' (default) or 'unselect-hidden'. When 'only-hidden' option selection state is not impacted by the filter. When 'unselect-hidden' hidden options are unselected.
 * @prop {boolean} showClear - Show a button to clear all shown (if filtered) options.
 * @prop {boolean} showSelectAll - Show a button to select all shown (if filtered) options.
 */

// noinspection JSUnusedGlobalSymbols
/**
 * Bootstrap-decorated select element supporting:
 *
 * - checkbox multi-select
 * - radio single-select
 * - select all / clear actions
 * - filtering
 * - progressive enhancement
 *
 * The original <select> remains the source of truth.
 *
 * Individual options may override their submit name using:
 *
 *   <option data-submit-name="rushOrder" ...>
 */
class DropdownSelect {
  /**
   * The default settings for a DropdownSelect.
   * @type {DropdownSelectSettings}
   */
  static #defaultSettings = {
    summarizeMultiple: false,
    showFilter: false,
    filterBehavior: 'only-hidden',
    showClear: false,
    showSelectAll: false
  };

  /**
   * All the initialized HTMLElements and their DropdownSelect objects.
   * @type {Map<HTMLElement, DropdownSelect>}
   */
  static #initializedEls = new Map();

  /** @type {HTMLSelectElement} */
  #select;

  /** @type {string} */
  #instanceId;

  /** @type {HTMLDivElement} */
  #wrapper;

  /** @type {HTMLButtonElement} */
  #button;

  /** @type {HTMLDivElement} */
  #menu;

  /** @type {((event: FormDataEvent) => void) | null} */
  #formDataHandler;

  /** @type {HTMLInputElement | null} */
  #filterInput = null;

  /**
   * @type {{
   *   option: HTMLOptionElement,
   *   input: HTMLInputElement,
   *   element: HTMLDivElement,
   *   label: string,
   *   value: string,
   *   submitName: string
   * }[]}
   */
  #items = [];

  /**
   * @type {DropdownSelectSettings}
   */
  #settings;

  /**
   * @param {string | HTMLSelectElement} el - A string selector or a select element.
   * @param {DropdownSelectSettings} [options]
   */
  constructor(el, options = {}) {
    this.#select = typeof el === 'string' ? document.querySelector(el) : el;
    if (!(this.#select instanceof HTMLSelectElement)) {
      throw new Error("DropdownSelect requires an HTMLSelectElement");
    }

    if (DropdownSelect.#initializedEls.has(this.#select)) {
      DropdownSelect.#initializedEls.get(this.#select).destroy();
    }

    this.#settings = Object.assign({}, DropdownSelect.#defaultSettings, options, this.#parseDatasetOptions());
    this.#instanceId = crypto.randomUUID?.() ?? `dropdown_select_${Date.now()}`;

    this.#hideSelect();
    this.#build();
    this.syncFromSelect();
    this.#bindFormDataHandler();

    DropdownSelect.#initializedEls.set(this.#select, this);
  }

  #parseDatasetOptions() {
    return Object.fromEntries(Object.entries(this.#select.dataset)
      .map(([key, value]) => [key, typeof DropdownSelect.#defaultSettings[key] === 'boolean' ? value === 'true' : value]));
  }

  /**
   * Synchronize select-backed items with the original select.
   */
  syncFromSelect() {
    for (const item of this.#items) {
      item.input.checked = item.option.hasAttribute('selected');
    }

    this.#updateButtonText();
  }

  #bindFormDataHandler() {
    const form = this.#select.form;
    if (!form) {
      return;
    }

    this.#formDataHandler = e => this.#handleFormData(e);
    form.addEventListener('formdata', this.#formDataHandler);
  }

  #unbindFormDataHandler() {
    const form = this.#select.form;
    if (!form || !this.#formDataHandler) {
      return;
    }

    form.removeEventListener('formdata', this.#formDataHandler);
    this.#formDataHandler = null;
  }

  /**
   * Remove native select and rebuild formData based on items
   */
  #handleFormData(event) {
    const formData = event.formData;
    formData.delete(this.#select.name);
    this.#selectedItems().filter(item => !item.input.disabled).forEach(item => formData.append(item.submitName, item.value));
  }

  /**
   * Select all visible options.
   * Only applies to multi-select mode.
   */
  selectAll() {
    if (!this.#select.multiple) {
      return;
    }

    this.#visibleItems().filter(item => !item.input.disabled).forEach(item => this.#setItemSelected(item, true));

    this.#updateButtonText();
    this.#dispatchChangeEvent();
  }

  clear() {
    this.#visibleItems().filter(item => !item.input.disabled).forEach(item => this.#setItemSelected(item, false));

    if (!this.#select.multiple) {
      const emptyOption = [...this.#select.options].find(option => option.value === '');
      if (emptyOption) {
        emptyOption.selected = true;
      }
    }

    this.#updateButtonText();
    this.#dispatchChangeEvent();
  }

  /**
   * Get selected values grouped by submit name.
   *
   * @returns {Object<string, string[]>}
   */
  get value() {
    return this.#selectedItems().reduce((values, item) => {
      if (!values[item.submitName]) {
        values[item.submitName] = [];
      }

      values[item.submitName].push(item.value);
      return values;
    }, {});
  }

  set value(value) {
    const valueMap = this.#normalizeValueMap(value);
    for (const item of this.#items) {
      const valueSet = valueMap.get(item.submitName);
      const shouldCheck = valueSet?.has(item.value) ?? false;
      item.option.toggleAttribute('selected', shouldCheck);
    }
    this.syncFromSelect()
  }

  #normalizeValueMap(value) {
    if (value == null) {
      return new Map();
    }

    if (typeof value !== 'object') {
      throw new TypeError(`DropdownSelect.value: expected object, got ${typeof value}`);
    }

    // Handles both forms: { order: ['beef', 'fish'] } and the convenience form { order: 'beef' }
    return new Map(Object.entries(value).map(([name, val]) => {
        const arr = Array.isArray(val) ? val : [val];
        return [name, new Set(arr.map(String))];
      })
    );
  }

  /**
   * Destroy component and restore original select.
   */
  destroy() {
    this.#wrapper.remove();
    this.#select.classList.remove('d-none');
    this.#unbindFormDataHandler();
    this.#wrapper = null;
    this.#button = null;
    this.#menu = null;
    this.#filterInput = null;
    DropdownSelect.#initializedEls.delete(this.#select);
  }

  #hideSelect() {
    this.#select.classList.add('d-none');
  }

  #build() {
    this.#buildWrapper();
    this.#buildButton();
    this.#buildMenu();
    this.#buildFilterInput();
    this.#buildActions();
    this.#buildOptions();
    this.#insertIntoDom();
  }

  #buildWrapper() {
    this.#wrapper = document.createElement('div');
    this.#wrapper.className = 'dropdown dropdown-select';
  }

  #buildButton() {
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#button.id = `${this.#instanceId}_button`;
    this.#button.className = 'form-select text-start';
    this.#button.setAttribute('data-bs-toggle', 'dropdown');
    this.#button.setAttribute('data-bs-auto-close', 'outside');
    this.#button.setAttribute('aria-expanded', 'false');
    this.#associateExternalLabel();
  }

  #associateExternalLabel() {
    if (!this.#select.id) {
      return;
    }

    const label = document.querySelector(`label[for='${this.#select.id}']`);
    if (!label) {
      return;
    }

    label.setAttribute('for', this.#button.id);
  }

  #buildMenu() {
    this.#menu = document.createElement('div');
    this.#menu.className = 'dropdown-menu w-100';
    this.#menu.addEventListener('click', e => e.stopPropagation());
  }

  #buildFilterInput() {
    if (!this.#settings.showFilter) {
      return;
    }

    this.#filterInput = document.createElement('input');
    this.#filterInput.type = 'search';
    this.#filterInput.className = 'form-control form-control-sm';
    this.#filterInput.placeholder = 'Filter...';
    this.#filterInput.addEventListener('input', () => this.#filter(this.#filterInput.value));
    this.#wrapper.addEventListener('shown.bs.dropdown', () => this.#filterInput.focus());

    const wrapper = document.createElement('div');
    wrapper.className = 'mb-2 mx-2';
    wrapper.appendChild(this.#filterInput);
    this.#menu.appendChild(wrapper);
  }

  #buildActions() {
    const actions = document.createElement('div');
    actions.className = 'd-flex mx-2 mb-1';

    if (this.#select.multiple && this.#settings.showSelectAll) {
      actions.appendChild(this.#buildSelectAllButton());
    }

    if (this.#settings.showClear) {
      actions.appendChild(this.#buildClearButton());
    }

    if (actions.children.length > 0) {
      this.#menu.appendChild(actions);
    }
  }

  #buildSelectAllButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-secondary flex-fill me-1';
    button.textContent = 'Select All';
    button.addEventListener('click', () => this.selectAll());
    return button;
  }

  #buildClearButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm btn-outline-secondary flex-fill';
    button.textContent = 'Clear';
    button.addEventListener('click', () => this.clear());
    return button;
  }

  #buildOptions() {
    [...this.#select.options].forEach(optionEl => {

      // skip empty option in single-select mode
      if (!this.#select.multiple && optionEl.value === '') {
        return;
      }

      const hasSubmitNameOverride = 'submitName' in optionEl.dataset;
      const type = this.#select.multiple || hasSubmitNameOverride ? 'checkbox' : 'radio';
      const disabled = this.#select.disabled || optionEl.disabled ? 'disabled' : '';
      const checked = optionEl.selected ? 'checked' : '';
      const optionClasses = optionEl.className;

      this.#menu.insertAdjacentHTML('beforeend', `
        <label class="dropdown-item text-wrap">
          <input type="${type}" class="form-check-input" ${disabled} ${checked}> <span class="${optionClasses}">${optionEl.text}</span>
        </label>
      `);

      const itemEl = this.#menu.lastElementChild;
      itemEl.addEventListener('click', e => e.stopPropagation());

      const inputEl = itemEl.firstElementChild;
      inputEl.addEventListener('click', e => e.stopPropagation());
      inputEl.addEventListener('change', () => this.#handleInputChange(optionEl, inputEl));

      this.#items.push({
        option: optionEl,
        input: inputEl,
        element: itemEl,
        label: optionEl.text,
        value: optionEl.value,
        submitName: optionEl.dataset.submitName ?? this.#select.name
      });
    });
  }

  #insertIntoDom() {
    this.#select.parentNode.insertBefore(this.#wrapper, this.#select);
    this.#wrapper.appendChild(this.#button);
    this.#wrapper.appendChild(this.#menu);
  }

  #handleInputChange(option, input) {
    option.selected = input.checked;

    if (!this.#select.multiple && input.type === 'radio') {
      for (const item of this.#items) {
        if (item.input === input || item.input.type === 'checkbox') {
          continue;
        }
        this.#setItemSelected(item, false);
      }
    }

    this.#updateButtonText();
    this.#dispatchChangeEvent();
  }

  #setItemSelected(item, selected) {
    item.input.checked = selected;
    item.option.selected = selected;
  }

  #dispatchChangeEvent() {
    this.#select.dispatchEvent(new Event('input', { bubbles: true }));
    this.#select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  #filter(text) {
    const query = text.trim().toLowerCase();
    for (const item of this.#items) {
      const matches = item.label.toLowerCase().includes(query);
      item.element.classList.toggle('d-none', !matches);

      if (!matches && !item.input.disabled && this.#settings.filterBehavior === 'unselect-hidden') {
        this.#setItemSelected(item, false);
      }
    }

    this.#updateButtonText();
    this.#dispatchChangeEvent();
  }

  #updateButtonText() {
    const selected = this.#selectedItems();
    if (selected.length === 0) {
      this.#button.innerHTML = '&nbsp;';
      return;
    }

    const label = selected.map(item => item.label).join(', ');
    const fits = this.#textFitsButton(label);
    const count = selected.length;

    if (fits && !(this.#settings.summarizeMultiple && count > 1)) {
      this.#button.textContent = label;
    }
    else {
      this.#button.textContent = `${count} selected`;
    }
  }

  #selectedItems() {
    return this.#items.filter(item => item.input.checked);
  }

  #visibleItems() {
    return this.#items.filter(item => !item.element.classList.contains('d-none'));
  }

  #textFitsButton(text) {
    const measure = document.createElement('span');
    const style = getComputedStyle(this.#button);
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'nowrap';
    measure.style.font = style.font;
    measure.style.fontSize = style.fontSize;
    measure.style.fontWeight = style.fontWeight;
    measure.style.letterSpacing = style.letterSpacing;
    measure.textContent = text;

    document.body.appendChild(measure);
    const textWidth = measure.offsetWidth;
    document.body.removeChild(measure);

    return textWidth <= (this.#getButtonWidth() - 50);
  }

  #getButtonWidth() {
    if (this.#button.clientWidth > 0) {
      return this.#button.clientWidth;
    }

    const clone = this.#button.cloneNode(true);

    Object.assign(clone.style, {
      visibility: 'hidden',
      display: 'block',
      position: 'fixed',
      top: '-9999px',
      left: '-9999px'
    });

    document.body.appendChild(clone);
    const width = clone.clientWidth;
    document.body.removeChild(clone);
    return width;
  }
}

export { DropdownSelect };