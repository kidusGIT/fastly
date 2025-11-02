import { createElement, Component } from "../../../packages/runtime/src/index";
import { Header } from "./Header";
import { TodoItem } from "./TodoItem";

export class App extends Component {
  todos = [
    { todo: "Do this", key: crypto.randomUUID() },
    { todo: "Do That", key: crypto.randomUUID() },
    { todo: "Feed the Dog", key: crypto.randomUUID() },
    { todo: "Wash the dishes", key: crypto.randomUUID() },
  ];

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
        createElement("h2", {
          attrs: {
            class: "flex-center",
          },
          children: ["Fastly Todo"],
        }),
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
              ? createElement("span", {
                  attrs: { class: "flex-center" },
                  children: ["All todos are done..."],
                })
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
