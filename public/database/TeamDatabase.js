const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new team databases that stores team member informaton in
 * @type {TeamDatabase}
 */
module.exports = class TeamDatabase extends LokiJS {
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
    super(TeamDatabase.Name);
    this.name = "[DB." + TeamDatabase.Name + "]";
    this.guid = Util.getGuid();
  }
};
