import { destroyDOM } from "./destroy-dom.js";
import { createElement } from "./h.js";
import { mountDOM } from "./mount-dom.js";

export function createApp(RootComponent, props = {}) {
  let parentEl = null;
  let isMounted = false;
  let vdom = null;

  function reset() {
    parentEl = null;
    isMounted = false;
    vdom = null;
  }

  return {
    mount(_parentEl) {
      if (isMounted) {
        throw new Error("The application is already mounted");
      }
      parentEl = _parentEl;
      vdom = createElement(RootComponent, { props });
      mountDOM(vdom, parentEl);

      isMounted = true;
    },
    unmount() {
      if (!isMounted) {
        throw new Error("The application is not mounted");
      }
      destroyDOM(vdom);
      reset();
    },
  };
}
