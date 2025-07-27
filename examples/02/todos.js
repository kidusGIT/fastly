import { createElement, Component } from "../../packages/runtime/src/index.js";

const app = document.getElementById("app");

class Header extends Component {
  todo = "";

  addTodo() {
    this.props.addTodo(this.todo);
    this.todo = "";
    this.setState();
  }

  render() {
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

class TodoItem extends Component {
  isEdit = false;
  text = this.props.todo;

  render() {
    const setEditable = () => {
      this.isEdit = !this.isEdit;
      this.setState();
    };

    // this.text = this.props.todo;

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
                  click: () => setEditable(),
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

// app.removeEventListener()

class App extends Component {
  todos = [{ todo: "Do this", key: crypto.randomUUID() }];

  addTodo(todo, index) {
    if (typeof index === "number") {
      this.todos[index].todo = todo;
      return;
    }

    const t = { todo, key: crypto.randomUUID() };
    this.todos.push(t);
    this.setState();
  }

  removeTodo(index) {
    this.setState(() => {
      this.todos.splice(index, 1);
    });
  }

  render() {
    return createElement("div", {
      attrs: { class: "" },
      children: [
        createElement(Header, {
          props: {
            todos: this.todos,
            addTodo: this.addTodo,
          },
        }),
        createElement("hr"),
        createElement("div", {
          children: [
            this.todos.length === 0
              ? "All todos are done"
              : createElement(
                  this.todos.map((todo, index) =>
                    createElement(TodoItem, {
                      key: todo.key,
                      props: {
                        removeTodo: this.removeTodo,
                        index,
                        todo: todo.todo,
                        addTodo: this.addTodo,
                      },
                    })
                  )
                ),
          ],
        }),
      ],
    });
  }
}

new App().mount(app);
