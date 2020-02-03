import uuid from 'uuid';
import { nonenumerable } from 'core-decorators';


export default class Model {
  static _primaryKey = 'generateUuid';
  static _requiredFields = [];
  static _messageRequiredField = 'This field is required';
  static _preFieldLabel = '';

  @nonenumerable
  generateUuid = '';

  @nonenumerable
  _options = '';

  constructor(obj, options = {}) {
    this._options = options;
    this._validateOptions();

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

  checkRequiredFields() {
    for (const field of this.constructor._requiredFields) {
      if (!this[field] && typeof this[field] !== 'boolean') {
        return false;
      }
    }
    return true;
  }

  validateRequiredFields() {
    const errors = [];
    for (const field of this.constructor._requiredFields) {
      if (!this[field] && typeof this[field] !== 'boolean') {
        errors.push({
          field: this.constructor._preFieldLabel + field,
          message: this.constructor._messageRequiredField,
        });
      }
    }
    return errors;
  }

  isValidRequiredField(fieldName) {
    return this._notExistFieldAndNotRequired(fieldName) || this.existsAndIsRequired(fieldName);
  }

  _notExistFieldAndNotRequired(fieldName) {
    return typeof this[fieldName] !== 'boolean' && !this[fieldName] && !this.existInRequiredFields(fieldName);
  }

  existsAndIsRequired(fieldName) {
    return this.existInRequiredFields(fieldName) && !!this[fieldName] && !this._isStringAndEmpty();
  }

  _isStringAndEmpty(fieldName) {
    return (typeof this[fieldName] === 'string' && this[fieldName] === '');
  }

  existInRequiredFields(fieldName) {
    const existRequired = this.constructor._requiredFields.includes(fieldName);

    return existRequired;
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
      const newObj = Object.assign({}, obj);
      const typesKeys = Object.keys(_types);
      for (const typeKey of typesKeys) {
        let FinalType = _types[typeKey];

        try {
          FinalType = FinalType(obj);
        } catch (error) {
          if (error.message !== 'Cannot call a class as a function') {
            throw error;
          }
        }

        if (obj[typeKey] && obj[typeKey].constructor !== FinalType) {
          newObj[typeKey] = // eslint-disable-line no-param-reassign
            new FinalType(obj[typeKey], this._options);
        }
      }
      return newObj;
    }
    return obj;
  }

  _assignObject(finalObject) {
    Object.assign(this, finalObject);
    if (this.getPrimaryKey() === 'generateUuid') {
      this._generateUuid();
    }
    if (!this.getKey()) {
      throw new Error('The value for primary key is not defined');
    }
  }

  _generateUuid() {
    this.generateUuid = uuid.v1();
  }

  _validateOptions() {
    if (this._options.constructor !== Object) {
      throw new Error('options parameters has to be an object');
    }

    if (this._options.unserializers && !Array.isArray(this._options.unserializers)) {
      throw new Error('Unserializer has to be an array');
    }
  }

  toObject() {
    const keys = Object.keys(this);
    const obj = {};

    keys.forEach((key) => {
      if (this[key] instanceof Model) {
        obj[key] = this[key].toObject();
      } else if (this[key] && typeof this[key].toArray === 'function') {
        obj[key] = this[key].toArray();
      } else {
        obj[key] = this[key];
      }
    });

    return obj;
  }
}
