import {
  createElement,
  mountDOM,
  destroyDOM,
  Component,
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

// mountDOM(vdom, app);

class SubItem extends Component {
  render() {
    return createElement("button", {
      children: ["val"],
    });
  }
}

class ItemList extends Component {
  constructor(number) {
    super();
    this.number = number;
  }

  render() {
    return createElement("div", {
      attrs: {
        class: "sub-item",
      },
      children: [
        createElement("span", {
          children: [`Hello world ${this.number}`],
        }),
        createElement(new SubItem()),
      ],
    });
  }
}

class HeaderComponent extends Component {
  count = 15;
  itemNumbers = [1, 3, 4, 6];

  render() {
    return createElement([
      createElement("div", {
        children: [
          createElement("h3", {
            children: [`Hello world ${this.count}`],
          }),
          createElement("button", {
            events: {
              click: () => {
                this.setState(() => (this.count += 5));
              },
            },
            children: ["Hi"],
          }),
        ],
      }),
      createElement("hr"),
      //   createElement(
      //     this.itemNumbers.map((num) => createElement(new ItemList(num)))
      //   ),
      createElement("div", {
        attrs: {
          class: "flex",
        },
        children: this.itemNumbers.map((num) =>
          createElement(new ItemList(num))
        ),
      }),
    ]);
  }
}

const head = new HeaderComponent();
head.mount(app);
