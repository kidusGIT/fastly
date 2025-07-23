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

  isRemoval(oldItem, index, operations = []) {
    if (!oldItem) {
      return false;
    }

    const key = oldItem?.key;
    if (key) {
      const newItem = this.#newItems.get(key) ?? null;
      if (newItem === null) {
        return true;
      }

      // if (this.isNoop(oldItem, newItem)) {
      //   const op = this.noopItem(newItem, index);
      //   operations.push(op);
      // } else {
      //   const op = this.moveItem(newItem, index);
      //   operations.push(op);
      // }

      return false;
    }

    const nodes = this.#newItems.get(oldItem?.tag) ?? [];
    if (Array.isArray(nodes) && nodes.length <= 0) {
      console.log("tag removed: ", oldItem?.tag);
      nodes.pop();
      return true;
    }
    // const moved = nodes.pop();

    // if (this.isNoop(oldItem, moved)) {
    //   const op = this.noopItem(oldItem, index);
    //   operations.push(op);
    // } else {
    //   const op = this.moveItem(oldItem, index);
    //   operations.push(op);
    // }

    return false;
  }

  isNoop(oldItem, newItem) {
    return this.#equalsFn(oldItem, newItem);
  }

  isAddition(newItem, index, operations = []) {
    const key = newItem?.key;
    if (key) {
      const oldItem = this.#oldItems.get(key) ?? null;
      if (oldItem === null) {
        return true;
      }

      // if (this.isNoop(newItem, oldItem)) {
      //   const op = this.noopItem(oldItem, index);
      //   operations.push(op);
      // } else {
      //   const op = this.moveItem(oldItem, index);
      //   operations.push(op);
      // }

      return false;
    }

    const nodes = this.#oldItems.get(newItem?.tag) ?? [];
    if (Array.isArray(nodes) && nodes.length === 0) {
      nodes.pop();
      return true;
    }
    // const moved = nodes.pop();

    // if (this.isNoop(newItem, moved)) {
    //   const op = this.noopItem(newItem, index);
    //   operations.push(op);
    // } else {
    //   const op = this.moveItem(newItem, index);
    //   operations.push(op);
    // }

    return false;
  }

  removeItem(removeItem, key, isLast = false) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index: key,
      item: removeItem,
    };

    if (!isLast) {
      this.#oldSetNodes.delete(key);
    }

    return operation;
  }

  noopItem(oldItem, newItem) {
    const originalIndex = oldItem.index;
    this.#getItem(oldItem, this.#oldItems);

    return {
      op: ARRAY_DIFF_OP.NOOP,
      originalIndex,
      index: newItem?.index,
      item: newItem,
    };
  }

  addItem(item, replacedItem) {
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index: item?.index,
      item,
    };

    console.log("index ", item.index);
    console.log("this.#oldItems ", this.#oldSetNodes);
    const oldItem = this.#oldSetNodes.get(item.index);

    if (!oldItem) {
      this.#oldSetNodes.set(item.index, item);
      return operation;
    }

    const size = this.#oldSetNodes.size;
    this.#oldSetNodes.set(item.index, item);
    this.#oldSetNodes.set(size, oldItem);

    return operation;
  }

  #getItem(item, map) {
    const key = item?.key;
    if (key) {
      const i = map.get(key);
      return i;
    }

    const nodes = map.get(item?.tag) ?? [];
    if (Array.isArray(nodes)) {
      const moved = nodes.pop();
      return moved;
    }
  }

  moveItem(item, toItem) {
    if (item) {
      return;
    }

    // console.log("old", this.#oldSetNodes);

    const originalItem = this.#getItem(toItem, this.#oldSetNodes);
    console.log("toItem: ", toItem);

    if (!originalItem) {
      throw Error("Invalid operation");
    }

    const originalIndex = originalItem?.index;
    const toIndex = toItem?.index;

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex,
      from: originalIndex,
      index: toIndex,
      item: toItem,
    };

    this.#oldSetNodes.set(originalIndex, item);
    this.#oldSetNodes.set(toIndex, item);

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
    let removeCounter = 0;
    let addCounter = 0;

    this.#newSetNodes.forEach((item, key) => {
      console.log("key: " + key + " removeCounter ", removeCounter);
      let oldItem = this.#oldSetNodes.get(key + removeCounter);

      if (oldItem && this.isRemoval(oldItem, key, operations)) {
        const op = this.removeItem(oldItem, key);
        operations.push(op);

        oldItem = this.#oldSetNodes.get(key + (removeCounter + 1));

        while (oldItem && this.isRemoval(oldItem, key, operations)) {
          console.log("key+ ", key + removeCounter);

          const op = this.removeItem(
            this.#oldSetNodes.get(key + removeCounter),
            key
          );
          operations.push(op);

          removeCounter++;
          oldItem = this.#oldSetNodes.get(key + removeCounter);
        }

        // return;
      }

      if (oldItem && this.isNoop(oldItem, item)) {
        // console.log("Noop: ", item, ", key: ", key);
        const op = this.noopItem(oldItem, item);
        operations.push(op);
        return;
      }

      if (this.isAddition(item)) {
        // console.log("Add: ", item, ", key: ", key);
        const op = this.addItem(item, oldItem);
        operations.push(op);
        addCounter > 0 && addCounter--;
        return;
      }
      // console.log("item ", item);
      // console.log("oldItem ", oldItem);
      this.moveItem(oldItem, item);
    });

    console.log("old: ", this.#oldSetNodes);
    console.log("*************");
    console.log("new: ", this.#newSetNodes);
    console.log("--------------------------------");
    console.log("operations: ", operations);
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
