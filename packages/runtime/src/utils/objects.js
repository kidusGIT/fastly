export function objectDiff(oldObj, newObj) {
  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);

  const mergedKeys = new Set([...oldKeys, ...newKeys]);

  const added = [];
  const removed = [];
  const updated = [];

  mergedKeys.forEach((key) => {
    if (!(key in oldObj) && key in newObj) {
      added.push(key);
    } else if (key in oldObj && !(key in newObj)) {
      removed.push(key);
    } else if (key in oldObj && key in newObj && oldObj[key] !== newObj[key]) {
      updated.push(key);
    }
  });

  return {
    added,
    removed,
    updated,
  };
}

export function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
