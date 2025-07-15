export function assignEventListener(el, name, handler) {
  el.addEventListener(name, handler);
}

export function addEventListeners(el, events = {}) {
  Object.entries(events).forEach(([name, handler]) => {
    el.addEventListener(name, handler);
  });
}

export function removeEventListener(el, events) {
  Object.entries(events).forEach(([name, handler]) => {
    el.removeEventListener(name, handler);
  });
}
