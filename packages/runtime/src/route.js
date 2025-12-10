import { makeRouteMatcher } from "./route-matchers.js";

class FastlyRouter {
  #_routes = [];
  #routes = {};
    #isInitialized = false

  constructor(routes = []) {
    const routesObj = {};
    this.#_routes = routes.map((route) => {
      if (!(route?.path in routesObj)) {
        throw `[Error]: ${route.path} is duplicated.`;
      }

      routesObj[route?.path] = route;
      return makeRouteMatcher(route);
    });
  }

  get #currentRouteHash() {
    const hash = document.location.hash;

    if (hash === "") return "/";

    return hash.slice(1);
  }

  #matchCurrentRoute() {

  }

  #onPopState() {

  }

  #pushState() {

  }

  async init() {
    if (this.#isInitialized) {
      return;
    }

    if (document.location === "") {
      window.history.replaceState({}, "", "/");
    }

    window.addEventListener("popstate", this.#onPopState);
    await this.#matchCurrentRoute();

    this.#isInitialized = true;
  }


  #onPopState = () => this.#matchCurrentRoute();

  navigateTo(path) {}
}
