import { CHILDREN } from "../../packages/runtime/src/h.js";
import {
  createElement,
  Component,
  createApp,
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
  render() {
    const { index, updateState } = this.props;
    return createElement("button", {
      events: {
        click: () => updateState(index),
      },
      children: ["val"],
    });
  }
}

class ItemList extends Component {
  isEdit;

  render() {
    const { updateState, count, number } = this.props;
    // console.log("index ", index);
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
          ? createElement("div", {
              // key: 15,
              children: [
                createElement("input", {
                  // key: 20,
                  attrs: {
                    placeholder: "Types some thing... ",
                  },
                  events: {
                    change: (e) => console.log("value: ", e.target.value),
                  },
                }),

                count == 20 && createElement(CHILDREN, {}),

                createElement("button", {
                  // key: 21,
                  events: {
                    click: () => setEditable(),
                  },
                  children: ["cancel"],
                }),

                count != 20 && createElement(CHILDREN, {}),
              ],
            })
          : createElement("div", {
              // key: 20,
              children: [
                createElement("span", {
                  children: [`items list ${number}`],
                }),
                createElement("button", {
                  events: {
                    click: () => setEditable(),
                  },
                  children: ["Edit"],
                }),
                createElement("button", {
                  events: {
                    click: () => {
                      // console.log("index called: ", this.props.index);
                      const { index } = this.props;
                      updateState(index);
                    },
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
  value = 2;
  itemNumbers = [
    { k: 1, v: 10 },
    { k: 3, v: 50 },
    { k: 4, v: 40 },
    { k: 8, v: 6 },
  ];

  updateState(index) {
    this.setState(() => {
      console.log("index ", index);
      console.log(
        "item before  ",
        JSON.parse(JSON.stringify(this.itemNumbers))
      );
      this.itemNumbers.splice(index, 1);
      console.log("item ", JSON.parse(JSON.stringify(this.itemNumbers)));
    });
  }

  propFunc(index) {
    this.value++;
    console.log("index: ", index);
    this.setState();
  }

  render() {
    const vdom = createElement([
      createElement("div", {
        attrs: {
          class: "",
          style: {
            paddingLeft: "10px",
          },
        },
        children: [
          createElement("h3", {
            children: [`Hello world ${this.count}`],
          }),
          createElement("div", {
            attrs: {
              style: {
                padding: "1px",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              },
            },
            children: [
              createElement("button", {
                events: {
                  click: () => {
                    this.setState(() => (this.count -= 5));
                  },
                },
                children: ["Subtract"],
              }),

              createElement("button", {
                events: {
                  click: () => {
                    this.setState(() => (this.count += 5));
                  },
                },
                children: ["Add"],
              }),

              createElement("span", {
                children: [`Count: ${this.value}`],
              }),
            ],
          }),
        ],
      }),
      createElement("hr"),
      createElement("div", {
        attrs: {
          class: "flex",
        },
        // children: [
        //   createElement(ItemList, {
        //     key: 12,
        //     props: {
        //       number: 12,
        //       updateState: this.updateState,
        //       count: this.count,
        //       index: 5,
        //     },
        //     children: [
        //       createElement("p", {
        //         children: [`Item ${this.value} - ${this.count}`],
        //       }),
        //       createElement(SubItem, {
        //         props: {
        //           index: 15,
        //           updateState: this.propFunc,
        //         },
        //       }),
        //     ],
        //   }),
        // ],
        children: this.itemNumbers.map((num, i) =>
          createElement(ItemList, {
            key: num.k,
            props: {
              number: num.v,
              updateState: this.updateState,
              count: this.count,
              index: i,
            },
            children: [
              createElement("p", {
                children: [`Item ${this.value} - ${this.count}`],
              }),
              createElement(SubItem, {
                props: {
                  index: 15,
                  updateState: this.propFunc,
                },
              }),
            ],
          })
        ),
      }),
    ]);

    return vdom;
  }
}

createApp(HeaderComponent).mount(app);
