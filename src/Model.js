import uuid from 'uuid';
import { nonenumerable } from 'core-decorators';

function fnBody(type) {
  return Function.prototype.toString.call(type).replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '');
}

function isClass(type) {
  return (
    /^class[\s{]/.test(Function.prototype.toString.call(type)) ||
    (/^.*classCallCheck\(/.test(fnBody(type))) ||
    (/^.*classCallCheck.\.default\)/.test(fnBody(type)))
  );
}

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
      const typesKeys = Object.keys(_types);
      for (const typeKey of typesKeys) {
        let FinalType = _types[typeKey];

        if (!isClass(FinalType)) {
          FinalType = FinalType(obj);
        }

        if (obj[typeKey] && obj[typeKey].constructor !== FinalType) {
          obj[typeKey] = // eslint-disable-line no-param-reassign
            new FinalType(obj[typeKey], this._options);
        }
      }
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

    keys.forEach((key) => { obj[key] = this[key]; });

    return obj;
  }
}
