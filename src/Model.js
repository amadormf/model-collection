import uuid from 'uuid';

export default class Model {
  static _primaryKey = 'uuid';
  constructor(obj, options = {}) {
    this._validateOptions(options);
    this._options = options;

    if (obj && obj.constructor === Object) {
      const unserializeObj = this._unserialize(obj);
      const finalObject = this._checkTypeProperties(unserializeObj);
      this._assignObject(finalObject);
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
    const { unserializers } = this._options;

    let unserializeObject = obj;
    if (unserializers) {
      for (const unserialize of unserializers) {
        unserializeObject = unserialize(unserializeObject);
      }
    }
    return unserializeObject;
  }

  _checkTypeProperties(obj) {
    const _types = this.constructor._types;
    if (_types) {
      const typesKeys = Object.keys(_types);
      for (const typeKey of typesKeys) {
        if (obj[typeKey] && obj[typeKey].constructor !== _types[typeKey]) {
          obj[typeKey] = new _types[typeKey](obj[typeKey], this._options); // eslint-disable-line
        }
      }
    }
    return obj;
  }

  _assignObject(finalObject) {
    Object.assign(this, finalObject);
    if (this.getPrimaryKey() === 'uuid') {
      this._generateUuid();
    } else {
      if (!this.getKey()) {
        throw new Error('The value for primary key is not defined');
      }
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

