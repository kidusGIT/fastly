# Fastly

## The Story of My Tiny Framework

Imagine a developer, bored on a weekend, thinking, "The world definitely needs **one more JavaScript framework**!" That's the vibe here.

- **What it is:** It's a **JavaScript frontend framework**. Think of it as a special toolkit for building the part of a website you actually see and interact with (the "frontend"). It's like having a specialized LEGO set for building web pages, but instead of plastic bricks, you get code pieces.
- **How it started:** It was a **hobby project**. The creator didn't build it for a big company or a paycheck; they just built it for fun, maybe while drinking too much coffee.
- **The Best Part:** They promise it's **simple to understand**. This is a **huge selling point** because, honestly, learning new tech often feels like try ing to read a wizard's spell book.
- **The Funny Part (The "Dreaded" Bit):** The framework uses JavaScript classes. The developer calls them "dreaded" because, in the modern JavaScript world, classes are sometimes seen as old-fashioned or overly complex compared to newer ways of writing code. It's like saying, "Yes, I built a fast new car, but I still put an 8-track player in it!" They're basically admitting, with a wink, that they used a classic (but controversial) method because it actually makes the **development process simple** for the user.

**In short:** It's a simple, homegrown web tool that uses good old-fashioned (some would say terrifying) JavaScript classes to help you build things easily. Now, we just need to see the **features**!

- State full component
- Reactive component
- States
- Lifecycle hooks
- Routing (coming soon)
- Template compiler (coming soon)

## 🏗️ How the Framework Builds a Web Page

This whole section is about the framework's main magic wand—the function it uses to turn code into something you can actually see on a screen, like a button or a headline.

### The Magic Word: `createElement`

Every time the framework wants to put something on the webpage (like a `<button>` or a `<h1>`), it shouts the command **`createElement`** (which literally means "create an element").

### The Recipe (The Parameters)

When the framework calls `createElement`, it has to give it a recipe (a list of instructions). This recipe looks like this:

**1. `tag` (The Name Tag):**

This is just the name of the HTML item you want. You give it simple names like "div", "h1", or "button". No complicated wizard names needed.

**2. The Big Bag of Instructions:**

The second part is a big shopping bag full of options. Here's what's inside:

- **`events` (The Behavior):** This is where you tell the element what to **do** when someone messes with it. For example, "When someone **clicks** this button, make a sound!"
- **`props` (The Component Secrets):** This entry is only used if you're building a special reusable chunk of code (a "component"). It passes **secret information** *only* to that component.
- **`attrs` (The Style & Extras):** This is for all the standard details—like giving it a **`class`** (for styling) or an inline **`style`** (to make it look pretty).
- **`children` (The Stuff Inside):** This is a list of everything that should go **inside** this element. If you have a `<div>` tag, the children are all the text, pictures, and other buttons that live *between* the opening and closing `div` tags.
- **`key` (The Tracking Number):** This is the **most boring but most important** part! It's a **unique ID** (a "key") for the element. The framework uses this ID like a detective to quickly track changes. It makes updating the screen **faster and easier**, so your app doesn't have to rebuild the entire page just because one little letter changed.

Look at the code below for better understanding:

```
// import createElement from packages/runtime/src/index.js

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
});
```

Okay, so the developer just showed us the magic word for building simple pieces (the `createElement` function). But you can't build a whole house one brick at a time—you need bigger pieces!

The developer is basically saying:

- "We know how to make a single piece of wall (an element)..."
- "...but to build a useful house (an app), we need bigger, reusable chunks of code."
- "So, let's learn how to make a Component next!"

### 💡 Introducing the Component (The Reusable Kit)

The component is going to be a **pre-built kit**. Instead of saying "create a div, then create a button, then put this text inside," you can just say: **"Create a Button component!"**

And, of course, they named their first component... **Button**. Look at the code below 

```jsx
// import createElement and Component from packages/runtime/src/index.js

class Button extends Component {  
	buttonText = this.props.buttonText
	
  render() {
    return createElement("button", {
      attrs: {
        disabled: false,
        style: {
          marginLeft: "10px",
        },
      },
      events: {
        click: () => this.addTodo(),
      },
      children: [buttonText],
    });
  }
}
```

The developer is explaining that simply **defining** a component isn't enough; it needs a way to actually **draw** itself.

- **The Component is Born:** Now we have a basic blueprint called the **`Component`** class. This is the container that holds everything important about that reusable piece of code, like its internal memory (**state**) and the instructions it receives from the outside world (**props**).
- **The Crucial Step: `render`:** To actually get something visible out of that blueprint, the component needs a special function called **`render`**.
- **The Package:** The developer then says they'll wrap their new component inside a bigger one called **`App`**.  Why **`App`**? This is just a conventional standard. Almost every single frontend framework (React, Vue, etc.) names the main, top-level component that holds everything else the **`App`** component.

Take a look at the `App` component code below.

```
// import createElement and Component from packages/runtime/src/index.js
// import Button component 

class App extends Component {
  render() {
    return createElement("div", {
      attrs: { class: "" },
      children: [
        createElement(Button, // Here we use Button component as a tag 
	      { 
          props: { // Use this to pass props to it
            buttonText: "Hello Button",
          },
        }),
      ],
    });
  }
}
```

And then by using the code below you can create a single page application using Fastly use the file you wrote the code below in your `index.html` file for better understanding check the `examples` directory I recommend using Vite for the development server  

And now for the grand finale! By using the **code below**, you can create a fully functional **Single-Page Application (SPA)** using your new framework, Fastly**.**

- **The Final Step:** Take the file where you wrote in the code bellow and link it in your **`index.html`** file.
- **The Cheat Sheet:** If things look confusing, don't worry! I highly recommend checking the **`examples`** directory for some good old-fashioned copy-and-paste inspiration.
- **Pro Tip:** To save your sanity (and your F5 key), use **Vite** as your development server. It's so fast, you might accidentally update your page before you even finish typing the code!

```jsx
const app = document.getElementById("app");
createApp(App).mount(app); // The App compoenet we created above 
```

### How to use state in Fastly

The developer make using state easy state in our framework is a function that used to reflect the changes on the DOM with out refreshing the whole page our framework compare the old and the new virtual DOM and only patch only the part that changes when the user interact in the browser yo can use the code below to use state on Fastly framework   

## 💾 Mastering **State** (The App's Memory)

The developer is talking about **State**, which is the **internal memory** of your application. It's how the framework remembers things, like whether a button is clicked, or what text the user typed in a box.

### The Magic of State

The framework makes using state **easy**! Here's what that special "state function" does:

1. **Reflecting Changes:** When the state changes (e.g., a counter goes from 1 to 2), the state function automatically handles the update. This means the webpage changes without refreshing the whole page—it's a smooth, modern experience!
2. **The Fastly Trick (The Virtual DOM):** This is where the framework earns its name. It does some clever computing behind the scenes:
    - It keeps a **Virtual DOM** (a fast, light-weight *copy* of your webpage) in memory.
    - When the state changes, it quickly compares the **old copy** to the **new copy**.
    - It finds the tiny little piece that changed (e.g., just the number **2**) and only updates—or **patches**—that one spot on the actual screen.
    - *The Analogy:* It's like finding a single typo in a massive book and only erasing and rewriting that one letter, instead of printing a whole new book! This is what makes the app feel **fast**.

### How to Use It

The developer concludes by saying, "You can use the code snippet below to use state..." This means they are about to show you the simple, special function call that lets your component start remembering things!

```jsx
this.setState(() => {
  this.todo = target.value;
});
```

or…

```
addTodo() {
  this.props.addTodo(this.todo);
  this.todo = "";
  this.setState(); // this code to change the state
}
```
