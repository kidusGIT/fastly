import { DOM_TYPES, hFragment } from "./h.js";
import { removeEventListener } from "./utils/events.js";

export function destroyDOM(vdom, component = null) {
  const { type } = vdom;
  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom, component);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom, component);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      const component = vdom.component;
      component.unmount();
      break;
    }

    case DOM_TYPES.CHILDREN: {
      if (component == null) {
        throw new Error("Component is required to un mount children.");
      }

      const children = component.children;
      destroyDOM(hFragment(children), component);
      break;
    }

    default: {
      throw new Error(`Can't destroy DOM of type: ${type}`);
    }
  }

  delete vdom.el;
}

function removeTextNode(vdom) {
  const { el } = vdom;
  el.remove();
}

function removeElementNode(vdom, component) {
  const { el, children, events, attrs } = vdom;

  el.remove();
  children.forEach((child) => destroyDOM(child, component));
  if (events) {
    removeEventListener(el, events);
  }
}

function removeFragmentNodes(vdom, component) {
  const { children } = vdom;
  children.forEach((child) => destroyDOM(child, component));
}
