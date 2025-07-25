export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
  COMPONENT: "component",
  CHILDREN: "children",
};

export const CHILDREN = DOM_TYPES.CHILDREN;

let slotIndex = -1;
let childrenArray = [];

export function resetSlotIndex() {
  slotIndex = -1;
  childrenArray = [];
}

export function getSlotIndex() {
  return { index: slotIndex, parents: childrenArray };
}

function h(tag, attributes = {}, events = {}, children = [], key, index = 0) {
  const type =
    typeof tag === "string" ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT;
  const { props, attrs } = attributes;

  const depth = [];

  return {
    tag,
    attrs: attrs ?? {},
    props,
    events,
    hasIndexChanged: false,
    type: tag === DOM_TYPES.CHILDREN ? DOM_TYPES.CHILDREN : type,
    key,
    index,
    children: mapTextNodes(children, depth),
  };
}

function mapTextNodes(children = []) {
  const vNodes = [];
  let counter = 0;
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    const childIndex = index - counter;

    if (!child || typeof child === "boolean") {
      counter++;
      continue;
    } else if (typeof child === "string") {
      vNodes.push(hString(child, childIndex));
      continue;
    }

    if (child?.tag === DOM_TYPES.CHILDREN) {
      slotIndex = childIndex;
      childrenArray = vNodes;
    }

    child["index"] = childIndex;
    vNodes.push(child);
  }

  return vNodes;
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

export function extractChildren(vdom, offset = 0) {
  if (vdom.children == null) {
    return [];
  }

  const children = [];
  for (const i in vdom.children) {
    const child = vdom.children[i];

    if (child.type === DOM_TYPES.FRAGMENT) {
      children.push(...extractChildren(child, parseInt(i) + offset));
    } else {
      child.index = children.length + offset;
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

const ch1 = createElement("div", {
  children: [
    createElement([
      createElement("i"),
      createElement("s"),
      createElement([
        createElement("b"),
        createElement("u"),
        createElement([createElement("f"), createElement("d")]),
      ]),
      createElement("g"),
      createElement("h"),
    ]),
  ],
});

const child = createElement([
  createElement("i"),
  createElement("s"),
  createElement([
    createElement("b"),
    createElement("u"),
    createElement([createElement("f"), createElement("d")]),
  ]),
  createElement("g"),
  createElement("h"),
]);

// const children = extractChildren(ch1);

// children.forEach((element) => {
//   console.log("index: " + element?.index + ", tag: " + element?.tag);
// });
// console.log("----------------------");
// const chil = extractChildren(ch1);
// chil.forEach((element) => {
//   console.log("index: " + element?.index + ", tag: " + element?.tag);
// });
