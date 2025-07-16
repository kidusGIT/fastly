import { DOM_TYPES } from "./h.js";
import { assignAttributes } from "./utils/attributes.js";
import { addEventListeners } from "./utils/events.js";

function insert(el, parentEl, index) {
  if (index == null) {
    parentEl.append(el);
    return;
  }

  if (index < 0) {
    throw new Error(`Index must be a positive integer, gor ${index}`);
  }

  const children = parentEl.childNodes;

  if (index >= children.length) {
    parentEl.append(el);
  } else {
    parentEl.insertBefore(el, children[index]);
  }
}

export function mountDOM(vdom, parentEl, index) {
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
    case DOM_TYPES.COMPONENT:
      createComponentNode(vdom, parentEl, index);
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
  insert(textNode, parentEl);
}

function createElementNode(vdom, parentEl, index) {
  const { tag, children } = vdom;
  const element = document.createElement(tag);

  const { attrs, events } = vdom;
  // assign events
  addEventListeners(element, events);

  // setting attributes
  assignAttributes(element, attrs);

  vdom.el = element;

  children.forEach((child) => mountDOM(child, element));
  insert(element, parentEl);
}

function createFragmentNode(vdom, parentEl, index) {
  const { children } = vdom;
  vdom.el = parentEl;

  children.forEach((child) => mountDOM(child, parentEl));
}

function createComponentNode(vdom, parentEl, index) {
  const { tag: Component, props } = vdom;
  // console.log("comp: ", component);
  const component = new Component();
  component.updateProps(props, false);

  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}
