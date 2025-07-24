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
  const vdoms = [];
  let counter = 0;
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    if (!child) {
      counter++;
      continue;
    } else if (typeof child === "string") {
      vdoms.push(hString(child, index - counter));
      continue;
    }

    child["index"] = index - counter;
    vdoms.push(child);
  }

  return vdoms;

  return children.map((child, index) => {
    // console.log("child ", child);
    if (!child) {
      console.log("is null ");
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
    // console.log("child ", child);
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
