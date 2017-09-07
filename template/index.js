class Script {
  constructor(config) {
    config = Object.assign({}, config);
    this._name = config.name || 'script';
  }
  renderName() {
    return this._name;
  }
}

module.exports = Script;
