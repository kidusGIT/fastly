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

export class ArrayOpDiffing {
  #array = [];
  #newArray = [];

  #equalsFn;
  #oldItems;
  #newItems;

  constructor(oldArray = [], newArray, equalsFn) {
    // const arr = [...oldArray];
    // console.log("oldArray (live): ", oldArray);
    // console.log("oldArray (clone): ", JSON.parse(JSON.stringify(oldArray)));
    // console.log("arr (live): ", arr);
    // console.log("arr (clone): ", JSON.parse(JSON.stringify(arr)));
    // console.log("-----------------------");

    // console.log("arr: ", arr);
    // console.log("-----------------------");
    this.#array = [...oldArray];
    this.#newArray = newArray;

    // console.log("array ", this.#array);
    // console.log("oldArray ", oldArray);
    // console.log("newArray ", this.#newArray);
    this.#equalsFn = equalsFn;

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
      return newItem === null;
    }

    const nodes = this.#newItems.get(oldItem?.tag) ?? [];
    if (Array.isArray(nodes) && nodes.length <= 0) {
      return true;
    }

    return false;
  }

  isNoop(oldItem, newItem) {
    return this.#equalsFn(oldItem, newItem);
  }

  isAddition(newItem) {
    const key = newItem?.key;
    if (key) {
      const oldItem = this.#oldItems.get(key) ?? null;
      return oldItem;
    }

    const nodes = this.#oldItems.get(newItem?.tag) ?? [];
    if (Array.isArray(nodes) && nodes.length === 0) {
      return null;
    }

    return nodes.pop();
  }

  #setCurrentIndex(item, index) {
    if (item) {
      item["currentIndex"] = index;
    }
  }

  removeItem(removeItem, key, isLast = false) {
    const operation = {
      op: ARRAY_DIFF_OP.REMOVE,
      index: key,
      item: removeItem,
    };

    if (!isLast) {
      const lastItem = this.#array.pop();
      if (this.length > 0) {
        this.#array[key] = lastItem;
        this.#setCurrentIndex(lastItem, key);
      }
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

  addItem(item) {
    const index = item?.index;
    const operation = {
      op: ARRAY_DIFF_OP.ADD,
      index,
      item,
    };

    const replacedItem = this.#array[index];
    this.#array[index] = item;
    replacedItem && this.#array.push(replacedItem);
    this.#setCurrentIndex(replacedItem, this.length - 1);

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

  moveItem(item, to) {
    const toIndex = to?.currentIndex ?? to?.index;
    const fromIndex = item?.currentIndex ?? item?.index;
    const originalIndex = item?.index;

    const toItem = this.#array[toIndex];
    this.#array[fromIndex] = toItem;
    this.#setCurrentIndex(toItem, fromIndex);

    this.#array[toIndex] = item;
    this.#setCurrentIndex(item, toIndex);

    const operation = {
      op: ARRAY_DIFF_OP.MOVE,
      originalIndex,
      from: originalIndex,
      index: to?.index,
      item: toItem,
    };

    return operation;
  }

  removeItemsAfter(index) {
    const operations = [];
    // console.log("index ", index);
    // console.log("this.length ", this.#array);
    while (this.length > index) {
      operations.push(this.removeItem(this.#array[index], index, true));
      index++;
    }

    return operations;
  }

  diffChildrenArray() {
    const operations = [];

    for (let index = 0; index < this.#newArray.length; index++) {
      if (this.isRemoval(this.#array[index], index)) {
        const op = this.removeItem(this.#array[index], index);
        operations.push(op);
        index--;
        continue;
      }

      if (this.isNoop(this.#array[index], this.#newArray[index])) {
        operations.push(
          this.noopItem(this.#array[index], this.#newArray[index])
        );
        continue;
      }

      let movedItem;

      if ((movedItem = this.isAddition(this.#newArray[index])) == null) {
        const op = this.addItem(this.#newArray[index], this.#array[index]);
        operations.push(op);
        continue;
      }

      operations.push(this.moveItem(movedItem, this.#newArray[index]));
    }

    operations.push(...this.removeItemsAfter(this.#newArray.length));
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

  return array.diffChildrenArray();

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
