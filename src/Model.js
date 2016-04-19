import uuid from 'uuid';

export default class Model {
  static _primaryKey = 'uuid';
  constructor(obj, options = {}) {
    if (options.constructor !== Object) {
      throw new Error('options parameters has to be an object');
    } else {
      this.options = options;
    }

    if (obj && obj.constructor === Object) {
      this._unserialize(obj);
    } else {
      throw new Error(
          'First argument passed to constructor is invalid, ' +
          'expect object(key,value) or array'
      );
    }
  }

  getPrimaryKey() {
    return this.constructor._primaryKey;
  }

  getKey() {
    return this[this.getPrimaryKey()];
  }

  _unserialize(obj) {
    const { unserializer } = this.options;
    let finalObject = obj;
    if (unserializer) {
      finalObject = unserializer.run(obj);
    }
    Object.assign(this, finalObject);
    if (this.getPrimaryKey() === 'uuid') {
      this._generateUuid();
    }
  }

  _generateUuid() {
    this.uuid = uuid.v1();
  }
}

