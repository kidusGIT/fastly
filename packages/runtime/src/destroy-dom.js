import { DOM_TYPES } from "./h.js";
import { removeEventListener } from "./utils/events.js";

export function destroyDOM(vdom) {
  const { type } = vdom;

  switch (type) {
    case DOM_TYPES.TEXT: {
      removeTextNode(vdom);
      break;
    }

    case DOM_TYPES.ELEMENT: {
      removeElementNode(vdom);
      break;
    }
    case DOM_TYPES.FRAGMENT: {
      removeFragmentNodes(vdom);
      break;
    }
    case DOM_TYPES.COMPONENT: {
      const component = vdom.component;
      component.unmount();
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

function removeElementNode(vdom) {
  const { el, children, events, attrs } = vdom;

  el.remove();
  children.forEach(destroyDOM);
  if (events) {
    removeEventListener(el, events);
  }

  if (attrs) {
  }
}

function removeFragmentNodes(vdom) {
  const { children } = vdom;
  children.forEach(destroyDOM);
}
