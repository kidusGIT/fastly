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
  #oldItems;
  #newItems;

  #oldSetNodes;
  #newSetNodes;

  constructor(oldArray, newArray, equalsFn) {
    this.#array = [...oldArray];
    this.#equalsFn = equalsFn;

    // newArray.forEach((item) => {
    //   const key = item?.props?.key ?? item?.index;
    //   this.#newItems[key] = item;
    // });

    // oldArray.forEach((item) => {
    //   const key = item?.props?.key ?? item?.index;
    //   this.#oldItems[key] = item;
    // });

    this.#oldSetNodes = this.#setNodes(oldArray);
    this.#newSetNodes = this.#setNodes(newArray);

    this.#oldItems = this.#setNodeKey(oldArray);
    this.#newItems = this.#setNodeKey(newArray);
  }

  #setNodes(items) {
    const map = new Map();
    items.forEach((item, index) => {
      map.set(index, item);
    });

    return map;
  }

  #setNodeKey(items = []) {
    const map = new Map();
    items.forEach((item) => {
      const key = item?.key;
      if (key) {
        map.set(key, item);
      } else {
        const tag = item?.tag;
        const nodes = map.get(tag) ?? [];
        if (Array.isArray(nodes)) {
          nodes.push(item);
        }
        map.set(tag, nodes);
      }
    });

    return map;
  }

  get length() {
    return this.#array.length;
  }

  #getKey(item) {
    return item?.key;
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

  isRemoval(index, operations = []) {
    const item = this.#oldSetNodes.get(index);
    if (item?.key) {
      const newItem = this.#newItems.get(item?.key) ?? null;
      return newItem === null;
    }

    const nodes = this.#newItems.get(item?.tag);
    if (Array.isArray(nodes) && nodes.length <= 0) {
      return true;
    }

    // moved

    return false;
  }

  isNoop(index, newItem) {
    // if (index >= this.length) {
    //   return false;
    // }

    const item = this.#oldSetNodes.get(index);
    return this.#equalsFn(item, newItem);
  }

  isAddition(item) {
    return this.#getOldItem(item) === null;
  }

  removeItem(index, isLast = false) {
    const removeItem = this.#oldSetNodes.get(index);

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

  noopItem(index) {
    const originalIndex = this.#array[index].index;

    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex,
      index,
      item: this.#array[index],
    };
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

  diffChildrenArray() {
    const operations = [];
    this.#newSetNodes.forEach((item, key) => {
      if (this.isRemoval(key)) {
        // remove it from the old set
        console.log("remove: ", item, ", key: ", key);
        return;
      }

      if (this.isNoop(key, item)) {
        console.log("Noop: ", item, ", key: ", key);
        return;
      }
    });
  }
}

export function arraysDiffSequence(
  oldArray,
  newArray,
  equalsFn = (a, b) => a === b
) {
  const sequence = [];
  const array = new ArrayOpDiffing(oldArray, newArray, equalsFn);

  array.diffChildrenArray();
  return;

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
