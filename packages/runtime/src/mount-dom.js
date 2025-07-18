import { DOM_TYPES, hFragment } from "./h.js";
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

const parent = [];

function getParent(isPop = false) {
  if (isPop) {
    return parent.pop();
  }

  return parent[parent.length - 1];
}

export function mountDOM(vdom, parentEl, index, component = null) {
  switch (vdom.type) {
    case DOM_TYPES.TEXT:
      createTextNode(vdom, parentEl);
      break;
    case DOM_TYPES.ELEMENT:
      createElementNode(vdom, parentEl, index, component);
      break;
    case DOM_TYPES.FRAGMENT:
      createFragmentNode(vdom, parentEl, index, component);
      break;
    case DOM_TYPES.COMPONENT:
      createComponentNode(vdom, parentEl, index);
      break;
    case DOM_TYPES.CHILDREN:
      if (component == null) {
        throw new Error("Component is required to mount children.");
      }

      injectChildren(component, parentEl, index);
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

function createElementNode(vdom, parentEl, index = null, component = null) {
  const { tag, children } = vdom;
  const element = document.createElement(tag);

  const { attrs, events } = vdom;
  // assign events
  addEventListeners(element, events);

  // setting attributes
  assignAttributes(element, attrs);

  vdom.el = element;
  parent.push(children);

  children.forEach((child) => mountDOM(child, element, index, component));
  insert(element, parentEl);
  getParent(true);
}

function createFragmentNode(vdom, parentEl, index, component = null) {
  const { children } = vdom;
  vdom.el = parentEl;

  parent.push(children);
  children.forEach((child) => mountDOM(child, parentEl, index, component));
  getParent(true);
}

function injectChildren(component, parentEl, index = null) {
  const children = component.children;
  mountDOM(hFragment(children), parentEl, index, component);
}

function createComponentNode(vdom, parentEl, index) {
  const { tag: Component, props, children } = vdom;

  const component = new Component();
  component.children = children;
  component.updateProps(props, false);

  component.mount(parentEl, index);
  vdom.component = component;
  vdom.el = component.firstElement;
}
