import { createElement, Component } from "../../../packages/runtime/src/index";

export class Header extends Component {
  todo = "";

  isLoading = false;

  async onMounted() {
    this.setState(() => (this.isLoading = true));
    // const res = await fetch(`https://dummyjson.com/products`);
    // const data = await res.json();
    this.setState(() => (this.isLoading = false));
  }

  async addTodo() {
    try {
      this.setState(() => (this.isLoading = true));
      const res = await fetch(`https://dummyjson.com/products`);
      const data = await res.json();

      this.props.addTodo(this.todo);
      this.todo = "";

      this.setState(() => (this.isLoading = false));
    } catch (error) {
      console.log("error ", error);
      this.setState(() => (this.isLoading = false));
    }
  }

  render() {
    if (this.isLoading) {
      console.log("hello ");

      return createElement("div", {
        children: [
          createElement("p", {
            children: ["Loading..."],
            attrs: { style: { marginLeft: "12px" } },
          }),
        ],
      });
    }

    return createElement("div", {
      attrs: {
        class: "item-style",
      },
      children: [
        createElement("input", {
          attrs: {
            placeholder: "Write a todo here...",
            value: this.todo,
            class: "flex-1",
          },
          events: {
            input: ({ target }) => {
              this.setState(() => {
                this.todo = target.value;
              });
            },
            keydown: ({ key }) => {
              if (key === "Enter" && this.todo.length >= 3) {
                this.addTodo();
              }
            },
          },
        }),
        createElement("button", {
          attrs: {
            disabled: this.todo.length < 3,
            style: {
              marginLeft: "10px",
            },
          },
          events: {
            click: () => this.addTodo(),
          },
          children: ["Add"],
        }),
      ],
    });
  }
}
