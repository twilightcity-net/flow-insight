const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new databases
 * @type {TeamDB}
 */
module.exports = class TeamDB extends LokiJS {
  /**
   * the file name of our team database
   * @returns {string}
   */
  static get Name() {
    return "team";
  }

  /**
   * builds our team database from lokijs instance
   */
  constructor() {
    super(TeamDB.Name);
    this.name = "[DB." + TeamDB.Name + "]";
    this.guid = Util.getGuid();
  }
};
