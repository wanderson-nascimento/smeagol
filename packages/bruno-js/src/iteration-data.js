class IterationData {
  constructor(data = {}) {
    this._data = { ...data };
  }

  get(key) {
    if (key === undefined || key === null) {
      return { ...this._data };
    }
    return this._data[key];
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this._data, key);
  }

  unset(key) {
    delete this._data[key];
  }

  stringify() {
    return JSON.stringify(this._data);
  }
}

module.exports = IterationData;
