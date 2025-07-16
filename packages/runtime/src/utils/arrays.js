import { h, hFragment } from "../h.js";

export const ARRAY_DIFF_OP = {
  ADD: "add",
  REMOVE: "remove",
  MOVE: "move",
  NOOP: "noop",
};

export function withOutNulls(arr) {
  return arr.filter((item) => item != null);
}

export function arraysDiff(oldArray, newArray) {
  return {
    added: newArray.filter((newItem) => !oldArray.includes(newItem)),
    removed: oldArray.filter((oldItem) => !newArray.includes(oldItem)),
  };
}

class ArrayOpDiffing {
  #array = [];
  #equalsFn;
  #oldItems = {};
  #newItems = {};

  constructor(array, oldArray, equalsFn) {
    this.#array = [...array];
    this.#equalsFn = equalsFn;

    oldArray.forEach((item) => {
      const key = item?.props?.key ?? item?.index;
      this.#newItems[key] = item;
    });

    array.forEach((item) => {
      const key = item?.props?.key ?? item?.index;
      this.#oldItems[key] = item;
    });
  }

  get length() {
    return this.#array.length;
  }

  #getKey(item) {
    return item?.props?.key ?? item?.index;
  }

  #getOldItem(item) {
    const key = this.#getKey(item);
    if (!(key in this.#oldItems)) {
      return null;
    }

    return this.#oldItems[key];
  }

  #getNewItem(item) {
    const key = this.#getKey(item);
    if (!(key in this.#newItems)) {
      return null;
    }

    return this.#newItems[key];
  }

  isRemoval(index) {
    const item = this.#array[index];
    return this.#getNewItem(item) === null;
  }

  removeItem(index, isLast = false) {
    const removeItem = this.#array[index];
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index,
      item: removeItem,
    };

    if (!isLast) {
      const lastItem = this.#array[this.length - 1];
      this.#array[index] = lastItem;
      this.#array.pop();
    }

    return operation;
  }

  isNoop(index, newItem) {
    if (index >= this.length) {
      return false;
    }

    const item = this.#array[index];
    return this.#equalsFn(item, newItem);
  }

  noopItem(index) {
    const originalIndex = this.#array[index].index;

    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex,
      index,
      item: this.#array[index],
    };
  }

  isAddition(item) {
    return this.#getOldItem(item) === null;
  }

  addItem(item) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index: item?.index,
      item,
    };

    return operation;
  }

  moveItem(item, toIndex) {
    const i = this.#getOldItem(item);
    if (i === null) {
      return;
    }

    const originalIndex = i?.index;

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex,
      from: originalIndex,
      index: toIndex,
      item: item,
    };

    this.#array.splice(i?.index, 1);
    this.#array.splice(item?.index, 0, item);
    return operation;
  }

  removeItemsAfter(index) {
    const operations = [];

    while (this.length > index) {
      operations.push(this.removeItem(index, true));
      index++;
    }

    return operations;
  }
}

export function arraysDiffSequence(
  oldArray,
  newArray,
  equalsFn = (a, b) => a === b
) {
  const sequence = [];
  const array = new ArrayOpDiffing(oldArray, newArray, equalsFn);

  for (let index = 0; index < newArray.length; index++) {
    const item = newArray[index];

    if (array.isNoop(index, item)) {
      sequence.push(array.noopItem(index));
      continue;
    }

    if (array.isAddition(item)) {
      sequence.push(array.addItem(item, index));
      continue;
    }

    if (array.isRemoval(index)) {
      sequence.push(array.removeItem(index));
      index--;
      continue;
    }

    sequence.push(array.moveItem(item, index));
  }

  sequence.push(...array.removeItemsAfter(newArray.length));

  return sequence;
}
