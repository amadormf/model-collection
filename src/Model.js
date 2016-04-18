export default class Model {
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

  _unserialize(obj) {
    const { unserializer } = this.options;
    let finalObject = obj;
    if (unserializer) {
      finalObject = unserializer.run(obj);
    }
    Object.assign(this, finalObject);
  }
}
