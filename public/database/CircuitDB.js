const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {CircuitDB}
 */
module.exports = class CircuitDB extends LokiJS {
  constructor() {
    super("circuit");
    this.name = "[DB.Circuit]";
    this.guid = Util.getGuid();
  }
};
