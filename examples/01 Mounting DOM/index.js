import { createElement, mountDOM } from "../../packages/runtime/src/index.js";

const app = document.getElementById("app");

const vdom = createElement([
  createElement("div", {
    children: [
      createElement("h1", {
        children: ["Hello"],
      }),
      createElement("button", {
        events: {
          click: () => console.log("clicked"),
        },
        children: ["click the button"],
      }),
    ],
  }),
  createElement("hr"),
  createElement("div", {
    children: [
      createElement("h2", {
        children: ["Hello world"],
      }),
      createElement("button", {
        events: {
          click: () => console.log("hi"),
        },
        children: ["Hi"],
      }),
    ],
  }),
]);

console.log(vdom);

mountDOM(vdom, app);
