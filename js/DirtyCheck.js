import { resolveSettings } from "./utils.js";

/**
 * @typedef {Object} DirtyCheckSettings
 * @property {string} dirtyIgnoreSelector Fields matching (or inside an element matching) this selector are excluded.
 * @property {boolean} dirtyTrackInput When true, re-evaluate on every keystroke (`input`) as well as on `change`.
 */

/**
 * Warns users before they navigate away from a page with unsaved form changes.
 *
 * Attach it to any container (usually a `<form>`). On construction it snapshots the
 * state of the container's fields as the "clean" baseline. After every `input`/`change`
 * event it compares the current state to that baseline and arms or disarms the
 * browser's `beforeunload` confirmation accordingly. Reverting a field to its original
 * value makes the container clean again. A `submit` event from inside the container
 * disarms the warning so legitimate saves don't prompt.
 *
 * Which fields participate:
 * - `input`, `select`, and `textarea` elements inside the container
 * - Must have a `name`, must not be disabled
 * - Buttons (`button`, `submit`, `reset`, `image`) never participate
 * - Fields matching, or nested inside an element matching, `dirtyIgnoreSelector`
 *   are excluded (by default, anything marked `data-dirty-ignore`)
 *
 * Settings, resolved by `resolveSettings` with precedence
 * defaults < constructor options < data attributes:
 *
 * | Setting               | Default                  | Data attribute                  |
 * |-----------------------|--------------------------|---------------------------------|
 * | `dirtyIgnoreSelector` | `[data-dirty-ignore]`    | `data-dirty-ignore-selector`    |
 * | `dirtyTrackInput`     | `true`                   | `data-dirty-track-input`        |
 *
 * Setting `dirtyIgnoreSelector` replaces the default; it does not extend it. Set
 * `dirtyTrackInput` to `false` to re-evaluate only on `change` (commit) rather than
 * on every keystroke.
 *
 * Limitations:
 * - Programmatic value changes (`el.value = 'x'`) fire no events, so they are not
 *   noticed until the next user `input`/`change` event triggers a re-comparison.
 * - `form.submit()` fires no `submit` event and will not disarm the warning. Use
 *   `form.requestSubmit()` or call {@link DirtyCheck#markClean} first.
 * - Settings are resolved once at construction; later attribute changes have no effect.
 * - Constructing a second instance on an element that already has one destroys the
 *   first and replaces it.
 *
 * @example <caption>Markup</caption>
 * <form data-isp-toggle="dirty-check" data-dirty-track-input="false">
 *   <input name="title">
 *   <input name="search" data-dirty-ignore>
 * </form>
 *
 * @example <caption>Construction (typically via initAll / initComponent)</caption>
 * initAll(DirtyCheck.SELECTOR, (el) => new DirtyCheck(el));
 *
 * @example <caption>After an AJAX save or asynchronously populating fields</caption>
 * DirtyCheck.for(formEl)?.markClean();
 */
class DirtyCheck {

  /**
   * The selector used to find elements to enhance with this component.
   * @type {string}
   */
  static #COMPONENT_SELECTOR = '[data-isp-toggle="dirty-check"]';

  /**
   * The default selector identifying elements this component should be attached to.
   * Read-only; consumed by whatever helper performs construction (e.g. initAll).
   * @type {string}
   */
  static get SELECTOR() {
    return DirtyCheck.#COMPONENT_SELECTOR;
  }

  /**
   * The elements whose state participates in the dirty comparison.
   * @type {string}
   */
  static #FIELD_SELECTOR = 'input, select, textarea';

  /**
   * Input types that never carry user-entered data.
   * @type {ReadonlyArray<string>}
   */
  static #UNTRACKED_INPUT_TYPES = Object.freeze(['button', 'submit', 'reset', 'image']);

  /**
   * The default settings for a DirtyCheck.
   * @type {Readonly<DirtyCheckSettings>}
   */
  static #DEFAULTS = Object.freeze({
    dirtyIgnoreSelector: '[data-dirty-ignore]',
    dirtyTrackInput: true
  });

  /**
   * All the initialized HTMLElements and their DirtyCheck objects.
   * @type {WeakMap<HTMLElement, DirtyCheck>}
   */
  static #INSTANCES = new WeakMap();

  /** @type {HTMLElement} */
  #el;

  /** @type {Readonly<DirtyCheckSettings>} */
  #settings;

  /** @type {string} */
  #initialSnapshot;

  /**
   * @param {string | HTMLElement} el - A string selector or a DOM element. The element wrapping the fields to watch (often a form).
   * @param {Partial<DirtyCheckSettings>} [options] Overrides. Precedence: defaults < options < data attributes.
   * @throws {Error} If `el` is a selector that matches nothing, or is not an HTMLElement.
   */
  constructor(el, options = {}) {
    this.#el = typeof el === 'string' ? document.querySelector(el) : el;

    if (!(this.#el instanceof HTMLElement)) {
      throw new Error(`DirtyCheck could not find HTMLElement: ${el}`);
    }

    if (DirtyCheck.#INSTANCES.has(this.#el)) {
      DirtyCheck.#INSTANCES.get(this.#el).destroy();
    }

    this.#settings = Object.freeze(resolveSettings(DirtyCheck.#DEFAULTS, options, this.#el));
    this.#initialSnapshot = this.#takeSnapshot();

    this.#el.addEventListener('change', this.#refresh);
    this.#el.addEventListener('submit', this.#disarm);
    if (this.#settings.dirtyTrackInput) {
      this.#el.addEventListener('input', this.#refresh);
    }

    DirtyCheck.#INSTANCES.set(this.#el, this);
  }

  /**
   * @param {HTMLElement} el
   * @returns {DirtyCheck | undefined} The instance attached to the element, if any.
   */
  static for(el) {
    return DirtyCheck.#INSTANCES.get(el);
  }

  /** True if tracked fields differ from the baseline. */
  get isDirty() {
    return this.#takeSnapshot() !== this.#initialSnapshot;
  }

  /** Accepts the current state as the clean baseline (e.g. after an AJAX save or async population). */
  markClean() {
    this.#initialSnapshot = this.#takeSnapshot();
    this.#disarm();
  }

  /** Removes all listeners and the registry entry. */
  destroy() {
    this.#disarm();
    this.#el.removeEventListener('change', this.#refresh);
    this.#el.removeEventListener('input', this.#refresh);
    this.#el.removeEventListener('submit', this.#disarm);
    DirtyCheck.#INSTANCES.delete(this.#el);
  }

  // Arrow-function fields keep stable references for removeEventListener.
  #preventNav = (e) => {
    e.preventDefault();
    // Modern browsers ignore custom text; the returnValue assignment is for older ones
    e.returnValue = '';
  };

  #arm = () => {
    window.removeEventListener('beforeunload', this.#preventNav);
    window.addEventListener('beforeunload', this.#preventNav);
  };

  #disarm = () => {
    window.removeEventListener('beforeunload', this.#preventNav);
  };

  // Single path: every event re-evaluates full state against the baseline.
  #refresh = () => {
    if (this.isDirty) {
      this.#arm();
    }
    else {
      this.#disarm();
    }
  };

  /**
   * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} field
   * @returns {boolean}
   */
  #isTrackedField(field) {
    return (
      !DirtyCheck.#UNTRACKED_INPUT_TYPES.includes(field.type) &&
      field.name !== '' &&
      !field.disabled &&
      !field.closest(this.#settings.dirtyIgnoreSelector)
    );
  }

  /**
   * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} field
   * @returns {boolean | string | string[]}
   */
  #getFieldState(field) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return field.checked;
    }
    if (field.type === 'select-multiple') {
      return Array.from(field.selectedOptions).map((option) => option.value);
    }
    if (field.type === 'file') {
      return Array.from(field.files).map((file) => file.name);
    }
    return field.value;
  }

  // Ordered [name, state] pairs vs object keyed by name, b/c radio groups and multi-value fields repeat names
  #takeSnapshot() {
    return JSON.stringify(
      Array.from(this.#el.querySelectorAll(DirtyCheck.#FIELD_SELECTOR))
        .filter((field) => this.#isTrackedField(field))
        .map((field) => [field.name, this.#getFieldState(field)])
    );
  }
}

export { DirtyCheck };