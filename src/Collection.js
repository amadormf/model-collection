export default class Collection {
  constructor(ModelClass, objects = [], options = {}) {
    if (!ModelClass) {
      throw new Error('ModelClass is not passed');
    }

    if (options.constructor !== Object) {
      throw new Error('options parameters has to be an object');
    }

    if (!Array.isArray(objects)) {
      throw new Error('Elements has to be an array');
    }

    this.Model = ModelClass;
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

  _addOneElement(element) {
    if (element instanceof this.Model) {
      this._map.set(element.getKey(), element);
    } else {
      const elementObj = new this.Model(element);
      this._map.set(elementObj.getKey(), elementObj);
    }
  }

  _addArray(elements) {
    for (let i = 0; i < elements.length; ++i) {
      this._addOneElement(new this.Model(elements[i]));
    }
  }

}
