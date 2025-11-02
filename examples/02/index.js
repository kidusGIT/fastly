import { createApp } from "../../packages/runtime/src/index";

import { App } from "./src/App";

const app = document.getElementById("app");
createApp(App).mount(app);
