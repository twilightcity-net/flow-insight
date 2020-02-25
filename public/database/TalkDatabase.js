const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used to build new databases
 * @type {TalkDatabase}
 */
module.exports = class TalkDatabase extends LokiJS {
  /**
   * the name of our talk database file
   * @returns {string}
   */
  static get Name() {
    return "talk";
  }

  /**
   * builds our talk database for messages
   */
  constructor() {
    super(TalkDatabase.Name);
    this.name = "[DB." + TalkDatabase.Name + "]";
    this.guid = Util.getGuid();
  }
};
