const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {JournalDB}
 */
module.exports = class JournalDB extends LokiJS {
  constructor() {
    super("journal");
    this.name = "[DB.Journal]";
    this.guid = Util.getGuid();
  }
};
