const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds a new databases
 * @type {CircuitDB}
 */
module.exports = class CircuitDB extends LokiJS {
  /**
   * the name of our database file
   * @returns {string}
   */
  static get Name() {
    return "circuit";
  }

  /**
   * builds our database class
   */
  constructor() {
    super(CircuitDB.Name);
    this.name = "[DB." + CircuitDB.Name + "]";
    this.guid = Util.getGuid();
  }
};
