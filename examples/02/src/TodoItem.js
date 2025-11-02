import { createElement, Component } from "../../../packages/runtime/src/index";

export class TodoItem extends Component {
  isEdit = false;
  text = this.props.todo;

  render() {
    const setEditable = () => {
      this.isEdit = !this.isEdit;
      this.setState();
    };

    return createElement("div", {
      attrs: {
        class: "item-style",
        style: {
          marginTop: "5px",
        },
      },
      children: [
        this.isEdit
          ? createElement([
              createElement("input", {
                attrs: { class: "flex-1", value: this.props.todo },
                events: {
                  input: ({ target }) => {
                    this.setState(() => {
                      this.props.todo = target.value;
                    });
                  },
                  keydown: ({ key }) => {
                    const { todo } = this.props;
                    if (key === "Enter" && todo?.length >= 3) {
                      this.props.addTodo(todo, this.props?.index);
                      setEditable();
                    }
                  },
                },
              }),
              createElement("button", {
                attrs: {
                  disabled: this.props.todo.length < 3,
                  style: {
                    marginLeft: "10px",
                  },
                },
                events: {
                  click: () =>
                    this.setState(() => {
                      this.props.addTodo(this.props.todo, this.props?.index);
                      setEditable();
                    }),
                },
                children: ["Save"],
              }),
              createElement("button", {
                attrs: {
                  style: {
                    marginLeft: "10px",
                  },
                },
                events: {
                  click: () => setEditable(),
                },
                children: ["Cancel"],
              }),
            ])
          : createElement([
              createElement("span", {
                attrs: { class: "flex-1" },
                events: {
                  dblclick: () => setEditable(),
                },
                children: [this.props?.todo],
              }),
              createElement("button", {
                attrs: {
                  style: {
                    marginLeft: "10px",
                  },
                },
                events: {
                  click: () =>
                    this.setState(() => {
                      this.props.removeTodo(this.props?.index);
                    }),
                },
                children: ["done"],
              }),
            ]),
      ],
    });
  }
}
