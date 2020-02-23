const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {TeamDB}
 */
module.exports = class TeamDB extends LokiJS {
  constructor() {
    super("team");
    this.name = "[DB.Team]";
    this.guid = Util.getGuid();
  }
};
