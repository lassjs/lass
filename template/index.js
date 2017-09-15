const autoBind = require('auto-bind');

class Script {
  constructor(config) {
    config = Object.assign({}, config);
    this._name = config.name || 'script';

    autoBind(this);
  }
  renderName() {
    return this._name;
  }
}

module.exports = Script;
