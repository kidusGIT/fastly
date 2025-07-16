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

//   createElement(
//     this.itemNumbers.map((num) => createElement(new ItemList(num)))
//   ),

// mountDOM(vdom, app);

class SubItem extends Component {
  constructor(updateState, i) {
    super();
    this.index = i;
    this.updateState = updateState;
  }

  render() {
    return createElement("button", {
      events: {
        click: () => this.updateState(this.index),
      },
      children: ["val"],
    });
  }
}

class ItemList extends Component {
  constructor(number, updateState, i) {
    super();
    this.number = number;
    this.index = i;
    this.updateState = updateState;
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
        createElement(new SubItem(this.updateState, this.index)),
      ],
    });
  }
}

class HeaderComponent extends Component {
  count = 15;
  itemNumbers = [1, 3, 4, 6];

  // constructor() {
  //   super();
  //   this.updateState = this.updateState.bind(this);
  // }

  updateState(index) {
    this.setState(() => {
      console.log(index);
      this.itemNumbers.splice(index, 1);
    });
  }

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
      createElement("div", {
        attrs: {
          class: "flex",
        },
        children: this.itemNumbers.map((num, i) =>
          createElement(new ItemList(num, this.updateState, i))
        ),
      }),
    ]);
  }
}

const head = new HeaderComponent();
head.mount(app);
