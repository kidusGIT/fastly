import { DOM_TYPES } from "./h";
import { addEventListeners } from "./utils/events";

export function mountDOM(vdom, parentEl) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT:
      createTextNode(vdom, parentEl);
      break;
    case DOM_TYPES.ELEMENT:
      createElementNode(vdom, parentEl);
      break;
    case DOM_TYPES.FRAGMENT:
      createFragmentNode(vdom, parentEl);
      break;

    default: {
      throw new Error(`Can't mount DOM of type: ${vdom.type}`);
    }
  }
}

function createTextNode(vdom, parentEl, index) {
  const { value } = vdom;
  const textNode = document.createTextNode(value);
  vdom.el = textNode;
}

function createElementNode(vdom, parentEl, index) {
  const { tag, children } = vdom;
  const element = document.createElement(tag);
  const { attrs, events } = vdom;

  // assign events
  addEventListeners(element, events);

  // setting attributes

  vdom.el = element;

  children.forEach((child) => mountDOM(child, element));
}

function createFragmentNode(vdom, parentEl, index) {
  const { children } = vdom;
  vdom.el = parentEl;

  children.forEach((child) => mountDOM(child, parentEl));
}
