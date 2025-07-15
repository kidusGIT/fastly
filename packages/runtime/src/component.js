import { destroyDOM } from "./destroy-dom.js";
import { DOM_TYPES, extractChildren } from "./h.js";
import { mountDOM } from "./mount-dom.js";

export class Component {
  #isMounted = false;
  #vdom = null;
  #hostEl = null;
  #children = [];

  constructor() {
    if (!this.render) {
      throw new Error(
        "Please provide valid implementation for the 'render' method."
      );
    }
  }

  get firstElement() {
    if (this.#vdom === null) return;

    if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
      return extractChildren(this.#vdom)[0].el;
    }

    return this.#vdom.el;
  }

  get offset() {
    if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
      //   console.log("firstElement", this.firstElement);

      return Array.from(this.#hostEl.children).indexOf(this.firstElement);
    }
    return 0;
  }

  setState(cb = () => {}) {
    cb();
    const el = this.#hostEl;
    this.unmount();
    this.#vdom = this.render();
    this.mount(el);
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

  //   render() {}
}
