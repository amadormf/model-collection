import uuid from 'uuid';

export default class Model {
  static _primaryKey = 'uuid';
  constructor(obj, options = {}) {
    this._validateOptions(options);
    
    this.options = options;

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
    const { unserializers } = this.options;

    let finalObject = obj;
    if (unserializers) {
      for (const unserialize of unserializers) {
        finalObject = unserialize(finalObject);
      }
    }
    Object.assign(this, finalObject);
    if (this.getPrimaryKey() === 'uuid') {
      this._generateUuid();
    }
  }

  _generateUuid() {
    this.uuid = uuid.v1();
  }
  _validateOptions(options) {
    if (options.constructor !== Object) {
      throw new Error('options parameters has to be an object');
    }

    if (options.unserializers && !Array.isArray(options.unserializers)) {
      throw new Error('Unserializer has to be an array');
    }
  }
}

