import { destroyDOM } from "./destroy-dom.js";
import { DOM_TYPES, extractChildren } from "./h.js";
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
    if (isNotMount) {
      this.#patch();
    }
  }

  setState(cb = () => {}) {
    cb();
    this.#patch();
  }

  mount(hostEl, index = null) {
    if (this.#isMounted) {
      throw new Error("Component is already mounted");
    }

    this.#vdom = this.render();
    mountDOM(this.#vdom, hostEl, index);

    this.#hostEl = hostEl;
    this.#isMounted = true;
  }

  unmount() {
    if (!this.#isMounted) {
      throw new Error("Component is not mounted");
    }

    destroyDOM(this.#vdom);

    this.#vdom = null;
    this.#hostEl = null;
    this.#isMounted = false;
  }

  #patch() {
    if (!this.#isMounted) {
      throw new Error("Component is not mounted.");
    }
    const el = this.#hostEl;

    this.#vdom = patchDOM(this.#vdom, this.render(), el);
  }
}
