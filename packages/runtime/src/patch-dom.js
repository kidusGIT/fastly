import { destroyDOM } from "./destroy-dom.js";
import { DOM_TYPES } from "./h.js";
import { mountDOM } from "./mount-dom.js";
import {
  addStyle,
  removeAttribute,
  removeStyle,
  setAttribute,
} from "./utils/attributes.js";
import { objectDiff } from "./utils/objects.js";
import { assignEventListener } from "./utils/events.js";
import { arraysDiff } from "./utils/arrays.js";

function isNotEmptyString(str) {
  return str !== "";
}

export function areNodesEqual(nodeOne, nodeTwo) {
  if (nodeOne?.type !== nodeTwo?.type) {
    return false;
  }

  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const {
      tag: tagOne,
      props: { key: keyOne },
    } = nodeOne;
    const {
      tag: tagTwo,
      props: { key: keyTwo },
    } = nodeTwo;

    return tagOne === tagTwo && keyOne === keyTwo;
  }

  if (nodeOne.type === DOM_TYPES.COMPONENT) {
    const {
      tag: componentOne,
      props: { key: keyOne },
    } = nodeOne;
    const {
      tag: componentTwo,
      props: { key: keyTwo },
    } = nodeTwo;

    return componentOne === componentTwo && keyOne === keyTwo;
  }

  return true;
}

function toClassList(classes = "") {
  return Array.isArray(classes)
    ? classes.filter((str) => isNotEmptyString(str.trim()))
    : classes.split(" ").filter((str) => isNotEmptyString(str.trim()));
}

export function patchDOM(oldVdom, newVdom, parentEl) {
  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = oldVdom.index;

    destroyDOM(oldVdom);
    mountDOM(newVdom, parentEl, index);
    return newVdom;
  }
  newVdom.el = oldVdom.el;

  switch (newVdom.type) {
    case DOM_TYPES.TEXT: {
      patchText(oldVdom, newVdom);
      return newVdom;
    }
    case DOM_TYPES.ELEMENT: {
      patchElement(oldVdom, newVdom);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      patchComponent(oldVdom, newVdom);
      break;
    }

    default:
      break;
  }
}

function patchText(oldVdom, newVdom) {
  const el = oldVdom.el;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;

  if (oldText !== newText) {
    el.nodeValue = newText;
  }
}

function patchComponent(oldVdom, newVdom) {
  const { tag: component } = oldVdom;

  newVdom.tag = component;
  newVdom.el = component.firstElement;
}

function patchElement(oldVdom, newVdom) {
  const el = oldVdom.el;

  const { class: oldClass, style: oldStyle, ...oldAttrs } = oldVdom.attrs;
  const oldEvents = oldVdom.events;

  const { class: newClass, style: newStyle, ...newAttrs } = newVdom.attrs;
  const newEvents = oldVdom.events;

  patchAttrs(el, oldAttrs, newAttrs);
  patchClass(el, oldClass, newClass);
  patchStyles(el, oldStyle, newStyle);
  patchEvents(el, oldEvents, newEvents);
}

function patchAttrs(el, oldAttrs, newAttrs) {
  const { added, removed, updated } = objectDiff(oldAttrs, newAttrs);

  for (const attr of removed) {
    removeAttribute(el, attr);
  }

  for (const attr of added.concat(updated)) {
    setAttribute(el, attr, newAttrs[attr]);
  }
}

function patchStyles(el, oldStyle = {}, newStyle = {}) {
  const { added, removed, updated } = objectDiff(oldStyle, newStyle);

  for (const style of removed) {
    removeStyle(el, style);
  }

  for (const style of added.concat(updated)) {
    addStyle(el, style, newStyle[style]);
  }
}

function patchClass(el, oldClass, newClass) {
  const oldClasses = toClassList(oldClass);
  const newClasses = toClassList(newClass);

  const { added, removed } = arraysDiff(oldClasses, newClasses);

  if (removed.length > 0) {
    el.classList.remove(...removed);
  }
  if (added.length > 0) {
    el.classList.add(...added);
  }
}

function patchEvents(el, oldEvents = {}, newEvents = {}) {
  const { removed, added, updated } = objectDiff(oldEvents, newEvents);

  for (const eventName of removed.concat(updated)) {
    el.removeEventListener(eventName, oldEvents[eventName]);
  }

  for (const eventName of added.concat(updated)) {
    assignEventListener(el, eventName, newEvents[eventName]);
  }
}
