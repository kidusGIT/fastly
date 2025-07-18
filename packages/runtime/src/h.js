export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  CHILDREN: "children",
};

export const CHILDREN = DOM_TYPES.CHILDREN;

function h(tag, attributes = {}, events = {}, children = [], key, index = 0) {
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  const { props, attrs } = attributes;

  return {
    tag,
    attrs: attrs ?? {},
    props,
    events,
    type: tag === DOM_TYPES.CHILDREN ? DOM_TYPES.CHILDREN : type,
    key,
    index,
    children: mapTextNodes(children),
  };
}

function mapTextNodes(children = []) {
  return children.map((child, index) => {
    if (child === null) {
      return;
    } else if (typeof child === "string") {
      return hString(child, index);
    }

    child["index"] = index;
    return child;
  });
}

function hString(value, index) {
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

export function createElement(
  tag,
  args = { events: {}, props: {}, attrs: {}, children: [], key: "" }
) {
  if (Array.isArray(tag)) {
    return hFragment(tag);
  }

  const { events, props, attrs, children, key } = args;
  const attributes = { attrs, props };

  return h(tag, attributes, events, children, key);
}
