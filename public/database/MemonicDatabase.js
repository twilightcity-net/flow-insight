const Util = require("../Util"),
  LokiJS = require("lokijs");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
module.exports = class MemonicDatabase extends LokiJS {
  constructor(name, scope) {
    super(name);
    console.log(this);
    // this.name = "[Database." + name + "]";
    // this.scope = scope;
    // this.guid = Util.getGuid();
  }
};
