export default class Model {
  constructor(obj) {
    if (typeof obj === 'object') {
      Object.assign(this, obj);
    } else {
      throw new Error(
          'First argument passed to constructor is invalid, ' +
          'expect object(key,value) or array'
      );
    }
  }
}
