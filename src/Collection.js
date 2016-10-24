import Model from './Model';

export default class Collection {
  static _ModelClass = Model;

  constructor(objects = [], options = {}) {
    if (options.constructor !== Object) {
      throw new Error('options parameters has to be an object');
    }
    this._options = options;

    if (!Array.isArray(objects)) {
      throw new Error('Elements has to be an array');
    }

    this._map = new Map();
    if (objects && objects.length > 0) {
      this._addArray(objects);
    }
  }

  add(element) {
    if (Object.prototype.toString.call(element) === '[object Array]') {
      this._addArray(element);
    } else {
      this._addOneElement(element);
    }
    return this;
  }

  size() {
    return this._map.size;
  }

  searchElements(field, value) {
    const items = [];
    for (const item of this._map.values()) {
      if (item[field] === value) {
        items.push(item);
      }
    }
    return items;
  }

  searchElement(keyValue) {
    return this._map.get(keyValue);
  }

  clear() {
    this._map.clear();
  }

  has(keyValue) {
    return this._map.has(keyValue);
  }

  delete(keyValue) {
    return this._map.delete(keyValue);
  }

  map(cb) {
    const arrayCollection = [];
    let index = 0;
    for (const element of this._map.values()) {
      arrayCollection.push(cb(element, index));
      index++;
    }
    return arrayCollection;
  }

  isEmpty() {
    return this.size() === 0;
  }

  getFirst() {
    return this._firstElement;
  }
  getLast() {
    return this._lastElement;
  }

  toArray() {
    return this.map(element => element);
  }

  toJSON() {
    return this.toArray();
  }

  iteratorOver() {
    const valuesArray = this.toArray();
    let index = valuesArray.length - 1;
    const iterable = {
      [Symbol.iterator]() {
        const iterator = {
          next() {
            if (index >= 0) {
              return { value: valuesArray[index--] };
            }
            return { done: true };
          },
        };
        return iterator;
      },
    };
    return iterable;
  }

  [Symbol.iterator]() {
    return this._map.values();
  }

  getIterator() {
    return this._map.values()[Symbol.iterator]();
  }

  getIteratorEntries() {
    return this._map[Symbol.iterator]();
  }

  _addOneElement(element) {
    if (element instanceof this._getModel()) {
      if (!this._firstElement) {
        this._firstElement = element;
      }
      this._lastElement = element;
      this._map.set(element.getKey(), element);
    } else {
      const elementObj = new (this._getModel())(element, this._options);
      if (!this._firstElement) {
        this._firstElement = elementObj;
      }
      this._lastElement = elementObj;
      this._map.set(elementObj.getKey(), elementObj);
    }
  }

  _addArray(elements) {
    if (this._options && this._options.sortBy) {
      elements.sort(this._options.sortBy);
    }

    if (this.constructor._sortFunction) {
      elements.sort(this.constructor._sortFunction);
    }

    for (let i = 0; i < elements.length; ++i) {
      this._addOneElement(new (this._getModel())(elements[i], this._options));
    }
  }


  _getModel() {
    return this.constructor._ModelClass;
  }


}
