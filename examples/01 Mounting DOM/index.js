import {
  createElement,
  mountDOM,
  destroyDOM,
} from "../../packages/runtime/src/index.js";

const app = document.getElementById("app");

function destroy() {
  console.log("destroy");
}

const header = createElement("div", {
  children: [
    createElement("h1", {
      children: ["Hello"],
    }),
    createElement("button", {
      events: {
        click: destroy,
      },
      children: ["click the button"],
    }),
  ],
});

const vdom = createElement([
  header,
  createElement("hr"),
  createElement("div", {
    children: [
      createElement("h2", {
        children: ["Hello world"],
      }),
      createElement("button", {
        events: {
          click: () => destroyDOM(header),
        },
        children: ["Hi"],
      }),
    ],
  }),
]);

console.log(vdom);

mountDOM(vdom, app);
