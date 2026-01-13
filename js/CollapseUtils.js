import { Collapse } from "https://cdn.jsdelivr.net/npm/bootstrap@5.3/+esm";

const context = new Map();

/**
 * When radio is checked, perform action on target collapse.
 *
 * Label Element (that encloses radio element) attributes
 * @property {selector} [data-target] (required) The selector used in a .querySelectorAll to find the collapses.
 * @property {'show' | 'hide'} [data-action] (required) The action taken when the radio is checked.
 */
function initRadioCollapse(selector = '[data-isp-toggle="radio-collapse"]') {
  if (!context.has('radioCollapseListener')) {
    context.set('radioCollapseListener', listener);
  }

  document.removeEventListener('input', context.get('radioCollapseListener'));
  document.addEventListener('input', context.get('radioCollapseListener'));

  function listener(e) {
    const labelEl = e.target.closest(selector);
    if (labelEl) {
      const collapseEls = document.querySelectorAll(labelEl.dataset.target);
      const collapses = [...collapseEls].map(el => Collapse.getOrCreateInstance(el, {toggle: false}));
      collapses.forEach(collapse => collapse[labelEl.dataset.action]());
    }
  }
}

/**
 * When checkbox is checked, perform action on target collapse. When unchecked will perform the opposite action.
 *
 * If multiple checkboxes are targeting the same collapse, if any are checked, then action will be performed.
 * If none are checked, then the opposite action will be performed.
 *
 * Label Element (that encloses checkbox element(s)) attributes
 * @property {selector} [data-target] (required) The selector used in a .querySelectorAll to find the collapses.
 * @property {'show' | 'hide'} [data-action] (required) The action taken when the checkbox is checked.
 */
function initCheckboxCollapse(selector = '[data-isp-toggle="checkbox-collapse"]') {
  if (!context.has('checkboxCollapseListener')) {
    context.set('checkboxCollapseListener', listener);
  }

  document.removeEventListener('input', context.get('checkboxCollapseListener'));
  document.addEventListener('input', context.get('checkboxCollapseListener'));

  function listener(e) {
    const labelEl = e.target.closest(selector);
    if (labelEl) {
      const checked = areAnyCheckedForThisTarget(labelEl);
      const collapseEls = document.querySelectorAll(labelEl.dataset.target);
      const collapses = [...collapseEls].map(el => Collapse.getOrCreateInstance(el, {toggle: false}));

      if (labelEl.dataset.action === 'show') {
        collapses.forEach(collapse => collapse[checked ? 'show' : 'hide']());
      }
      else {
        collapses.forEach(collapse => collapse[checked ? 'hide' : 'show']());
      }
    }
  }

  //find all the other checkboxes that are targeting the same collapse and check if any of them are checked.
  function areAnyCheckedForThisTarget(labelEl) {
    const groupSelector = selector + '[data-target="' + labelEl.dataset.target + '"]';
    const labelGroup = [...document.querySelectorAll(groupSelector)];
    const checkboxGroup = labelGroup.flatMap(el => el.querySelector('[type="checkbox"]'));
    return checkboxGroup.filter(el => el.checked).length > 0;
  }
}

/**
 * Performs applied or selected action on applied or selected collapse. In the case
 * where target is on the option, unselected targets will perform the opposite action.
 *
 * Here may be an easy way to think about it. To start, there are two data attributes
 * (besides the toggle attribute). You have an action and a target attribute. Put one
 * on the select and the other on the option. Match to get the desired action on the
 * desired target.
 *
 * <select data-app-toggle="select-collapse" data-target="#sometimes-div">
 *   <option data-action="show">One</option>
 *   <option data-action="hide">Two</option>
 *   <option data-action="show">Three</option>
 * </select>
 *
 * In the above example, sometimes-div will show when options 'One' and 'Three' are
 * picked and hide when option 'Two' is picked.
 *
 * <select data-app-toggle="select-collapse" data-action="show">
 *   <option data-target="#male-stuff">Male</option>
 *   <option data-target="#female-stuff">Female</option>
 *   <option data-target="#other-stuff">Other</option>
 * </select>
 *
 * In the above example, male-stuff will be shown when 'Male' is selected and hidden
 * when the other options are selected.
 *
 * Select or Option Element (one on each)
 * @property {selector} [data-target] (required) The selector used in a .querySelectorAll to find the collapses.
 * @property {'show' | 'hide'} [data-action] (required) The action taken when a selection is made.
 */
function initSelectCollapse(selector = '[data-isp-toggle="select-collapse"]') {
  if (!context.has('selectCollapseListener')) {
    context.set('selectCollapseListener', listener);
  }

  document.removeEventListener('input', context.get('selectCollapseListener'));
  document.addEventListener('input', context.get('selectCollapseListener'));

  function listener(e) {
    const selectEl = e.target.closest(selector);
    if (selectEl) {
      if (!selectEl.dataset.action) {
        applySelectedActionToTarget(selectEl);
      }
      if (!selectEl.dataset.target) {
        applyActionToSelectedTarget(selectEl);
      }
    }
  }

  function applySelectedActionToTarget(selectEl) {
    const action = selectEl.options[selectEl.selectedIndex].dataset.action;

    if (action) {
      const collapseEls = document.querySelectorAll(selectEl.dataset.target);
      const collapses = [...collapseEls].map(el => Collapse.getOrCreateInstance(el, {toggle: false}));
      collapses.forEach(collapse => collapse[action === 'show' ? 'show' : 'hide']());
    }
  }

  function applyActionToSelectedTarget(selectEl) {
    const selectedIndex = selectEl.selectedIndex;
    const selectedOption = selectEl.options[selectedIndex];
    const selectedTarget = selectedOption.dataset.target;
    const action = selectEl.dataset.action;

    [...selectEl.children].forEach(toggleOtherCollapses);

    //toggleSelectedCollapses
    if (selectedTarget) {
      const collapseEls = document.querySelectorAll(selectedTarget);
      const collapses = [...collapseEls].map(el => Collapse.getOrCreateInstance(el, {toggle: false}));
      collapses.forEach(collapse => collapse[action === 'show' ? 'show' : 'hide']());
    }

    function toggleOtherCollapses(option) {
      if (option.dataset.target && option.dataset.target !== selectedTarget) {
        const collapseEls = document.querySelectorAll(option.dataset.target);
        const collapses = [...collapseEls].map(el => Collapse.getOrCreateInstance(el, {toggle: false}));
        collapses.forEach(collapse => collapse[action === 'show' ? 'hide' : 'show']());
      }
    }
  }
}

export { initRadioCollapse, initCheckboxCollapse, initSelectCollapse };