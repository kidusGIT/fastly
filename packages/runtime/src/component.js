import { destroyDOM } from "./destroy-dom.js";
import {
  DOM_TYPES,
  extractChildren,
  getSlotIndex,
  hFragment,
  resetSlotIndex,
} from "./h.js";
import { mountDOM } from "./mount-dom.js";
import { patchDOM } from "./patch-dom.js";

function autoBind(instance) {
  Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).forEach(
    (method) => {
      if (typeof instance[method] === "function" && method !== "constructor") {
        instance[method] = instance[method].bind(instance);
      }
    }
  );
}

export class Component {
  #isMounted = false;
  #vdom = null;
  #hostEl = null;
  #props = {};
  #children = [];

  set children(children = []) {
    this.#children = children;
  }

  get children() {
    return this.#children;
  }

  constructor() {
    if (!this.render) {
      throw new Error(
        "Please provide valid implementation for the 'render' method."
      );
    }
    autoBind(this);
  }

  get firstElement() {
    if (this.#vdom === null) return;

    if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
      return extractChildren(this.#vdom)[0].el;
    }

    return this.#vdom.el;
  }

  get props() {
    return this.#props;
  }

  get offset() {
    if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
      //   console.log("firstElement", this.firstElement);
      return Array.from(this.#hostEl.children).indexOf(this.firstElement);
    }
    return 0;
  }

  updateProps(props = {}, isNotMount = true) {
    this.#props = props;
    if (isNotMount && this.#isMounted) {
      this.#patch();
    }
  }

  setState(cb = () => {}) {
    cb();
    if (this.#isMounted) {
      this.#patch();
    }
  }

  #_render() {
    const vdom = this.render();
    const { index, parents } = getSlotIndex();

    if (index > -1) {
      const view = this.#children.map((obj) => Object.assign({}, obj));
      parents[index] = hFragment(view);
      resetSlotIndex();
    }

    return vdom;
  }

  mount(hostEl, index = null) {
    if (this.#isMounted) {
      throw new Error("Component is already mounted");
    }

    this.#vdom = this.#_render();
    mountDOM(this.#vdom, hostEl, index, this);

    this.#hostEl = hostEl;
    this.#isMounted = true;
  }

  unmount() {
    if (!this.#isMounted) {
      throw new Error("Component is not mounted");
    }

    destroyDOM(this.#vdom, this);

    this.#vdom = null;
    this.#hostEl = null;
    this.#isMounted = false;
  }

  #patch() {
    if (!this.#isMounted) {
      throw new Error("Component is not mounted.");
    }
    const el = this.#hostEl;
    const vdom = this.#_render();

    this.#vdom = patchDOM(this.#vdom, vdom, el, this);
  }

  render() {}
}
