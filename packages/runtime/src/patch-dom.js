import { destroyDOM } from "./destroy-dom.js";
import { createElement, DOM_TYPES, extractChildren } from "./h.js";
import { mountDOM } from "./mount-dom.js";
import {
  addStyle,
  removeAttribute,
  removeStyle,
  setAttribute,
} from "./utils/attributes.js";
import { objectDiff } from "./utils/objects.js";
import { assignEventListener } from "./utils/events.js";
import {
  ARRAY_DIFF_OP,
  arraysDiff,
  arraysDiffSequence,
} from "./utils/arrays.js";

function isNotEmptyString(str) {
  return str !== "";
}

export function areNodesEqual(nodeOne, nodeTwo) {
  if (nodeOne?.type !== nodeTwo?.type) {
    return false;
  }

  if (nodeOne.type === DOM_TYPES.ELEMENT) {
    const { tag: tagOne, key: keyOne } = nodeOne;
    const { tag: tagTwo, key: keyTwo } = nodeTwo;

    return tagOne === tagTwo && keyOne === keyTwo;
  }

  if (nodeOne.type === DOM_TYPES.COMPONENT) {
    const { tag: componentOne, key: keyOne } = nodeOne;
    const { tag: componentTwo, key: keyTwo } = nodeTwo;

    return componentOne === componentTwo && keyOne === keyTwo;
  }

  return true;
}

function toClassList(classes = "") {
  return Array.isArray(classes)
    ? classes.filter((str) => isNotEmptyString(str.trim()))
    : classes.split(" ").filter((str) => isNotEmptyString(str.trim()));
}

export function patchDOM(oldVdom, newVdom, parentEl, component = null) {
  // console.log("oldVdom: ", oldVdom);
  // console.log("newVdom: ", newVdom);

  if (!areNodesEqual(oldVdom, newVdom)) {
    const index = oldVdom.index;

    destroyDOM(oldVdom, component);
    mountDOM(newVdom, parentEl, index, component);
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
    case DOM_TYPES.CHILDREN: {
      console.log("children");
      break;
    }
  }

  patchChildren(oldVdom, newVdom, component);
  return newVdom;
}

function patchText(oldVdom, newVdom) {
  const el = oldVdom.el;
  const { value: oldText } = oldVdom;
  const { value: newText } = newVdom;

  if (oldText !== newText && el) {
    el.nodeValue = newText;
  }
}

function patchComponent(oldVdom, newVdom) {
  const { component } = oldVdom;
  const { props, children } = newVdom;
  if (!component) return;

  component.updateProps(props);
  component.children = children;

  newVdom.component = component;
  newVdom.el = component.firstElement;
}

function patchChildren(oldVdom, newVdom, hostComponent) {
  const oldChildren = extractChildren(oldVdom);
  const newChildren = extractChildren(newVdom);
  const parentEl = oldVdom.el;

  const diffSeq = arraysDiffSequence(oldChildren, newChildren, areNodesEqual);

  // console.log("diffSeq: ", diffSeq);

  return;

  for (const operation of diffSeq) {
    const { originalIndex, index, item } = operation;
    const offset = hostComponent?.offset ?? 0;

    switch (operation.op) {
      case ARRAY_DIFF_OP.ADD: {
        mountDOM(item, parentEl, index + offset, hostComponent);
        break;
      }

      case ARRAY_DIFF_OP.REMOVE: {
        destroyDOM(item, hostComponent);
        break;
      }

      case ARRAY_DIFF_OP.MOVE: {
        const oldChild = oldChildren[originalIndex];
        const newChild = newChildren[index];
        const el = oldChild.el;
        const elAtTargetIndex = parentEl.childNodes[index];

        console.log("elAtTargetIndex: ", elAtTargetIndex);
        console.log("el: ", el);
        // console.log("index: ", index);
        // console.log("before childNodes: ", parentEl.childNodes);
        parentEl.insertBefore(el, elAtTargetIndex);
        // then patch the children of the moved element
        // console.log("after childNodes: ", parentEl.childNodes);
        patchDOM(oldChild, newChild, parentEl, hostComponent);
        break;
      }

      case ARRAY_DIFF_OP.NOOP: {
        // then patch the children of the moved element

        patchDOM(
          oldChildren[originalIndex],
          newChildren[index],
          parentEl,
          hostComponent
        );
        break;
      }
    }
  }
}

const f1 = createElement([
  true
    ? createElement([
        createElement("input", { key: 10 }),
        createElement("button", {
          children: ["cancel"],
          key: 11,
        }),
      ])
    : createElement([
        createElement("span", {
          children: [`items list ${2}`],
          key: 12,
        }),

        createElement("button", {
          children: ["Edit"],
          key: 13,
        }),
        createElement("button", {
          children: ["remove"],
          key: 14,
        }),
      ]),
]);

const f2 = createElement([
  false
    ? createElement([
        createElement("input", { key: 10 }),
        createElement("button", {
          children: ["cancel"],
          key: 11,
        }),
      ])
    : createElement([
        createElement("span", {
          children: [`items list ${2}`],
          key: 12,
        }),

        createElement("button", {
          children: ["Edit"],
          key: 13,
        }),
        createElement("button", {
          children: ["remove"],
          key: 14,
        }),
      ]),
]);

patchChildren(f1, f2);

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
