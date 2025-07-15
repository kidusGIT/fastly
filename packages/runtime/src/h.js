export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  SLOT: "slot",
};

export function h(tag, attrs = {}, events = {}, children = [], index = 0) {
  const type = DOM_TYPES.ELEMENT;
  return {
    tag,
    attrs,
    events,
    type,
    index,
    children: mapTextNodes(children),
  };
}

function mapTextNodes(children = []) {
  return children.map((child) => {
    if (child === null) {
      return;
    } else if (typeof child === "string") {
      return hString(child, index);
    }

    child["index"] = index;
    return child;
  });
}

export function hString(value, index) {
  return { type: DOM_TYPES.TEXT, value, index };
}

export function hFragment(vNodes) {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(vNodes),
  };
}

export function extractChildren(vdom) {
  if (vdom.children == null) {
    return [];
  }

  const children = [];
  for (const child of vdom.children) {
    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child));
    } else {
      children.push(child);
    }
  }

  return children;
}

export function createElement(tag, { events: {}, attrs: {}, children: [] }) {
  if (Array.isArray(tag)) {
    return hFragment(tag);
  }

  return h(tag, attrs, events, children);
}
