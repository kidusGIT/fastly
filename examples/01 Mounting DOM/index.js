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
  isEdit;

  render() {
    const { index, updateState, count, number } = this.props;

    const setEditable = () => {
      this.isEdit = !this.isEdit;
      this.setState();
    };

    return createElement("div", {
      attrs: {
        class: "sub-item",
      },
      children: [
        this.isEdit
          ? createElement("span", {
              children: [
                createElement("input", {
                  events: {
                    change: (e) => console.log("value: ", e.target.value),
                  },
                }),
                createElement("button", {
                  events: {
                    click: () => setEditable(),
                  },
                  children: ["cancel"],
                }),
              ],
            })
          : createElement("div", {
              children: [
                createElement("span", {
                  children: [`items list ${number + count}    `],
                }),

                createElement("button", {
                  events: {
                    click: () => setEditable(),
                  },
                  children: ["Edit"],
                }),
                createElement("button", {
                  events: {
                    click: () => updateState(index),
                  },
                  children: ["remove"],
                }),
              ],
            }),
      ],
    });
  }
}

class HeaderComponent extends Component {
  count = 15;
  itemNumbers = [
    { k: 1, v: 10 },
    { k: 3, v: 50 },
    { k: 4, v: 40 },
    { k: 8, v: 6 },
  ];

  updateState(index) {
    this.setState(() => {
      this.itemNumbers.splice(index, 1);
    });
  }

  render() {
    const vdom = createElement([
      createElement("div", {
        attrs: {
          class: "",
        },
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
          createElement(ItemList, {
            key: num.k,
            props: {
              number: num.v,
              updateState: this.updateState,
              count: this.count,
              index: i,
            },
          })
        ),
      }),
    ]);

    return vdom;
  }
}

const head = new HeaderComponent();
head.mount(app);
