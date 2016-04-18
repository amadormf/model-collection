export default class Unserializer {
  constructor(options = {}) {
    this.options = options;
  }

  run() {
    throw new Error('Override this functions in your class');
  }
}
