const TalkDB = require("./TalkDatabase"),
  JournalDB = require("./JournalDatabase"),
  CircuitDB = require("./CircuitDatabase"),
  TeamDB = require("./TeamDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
module.exports = class DatabaseFactory {
  /**
   * the names of our databases
   * @returns {{JOURNAL: string, TALK: string}}
   * @constructor
   */
  static get Names() {
    return {
      TALK: "talk",
      JOURNAL: "journal",
      CIRCUIT: "circuit",
      TEAM: "team"
    };
  }

  /**
   * creates our in memory database and return it
   * @param name
   * @returns {DatabaseFactory}
   */
  static createDatabase(name) {
    switch (name) {
      case DatabaseFactory.Names.TALK:
        return new TalkDB();
      case DatabaseFactory.Names.JOURNAL:
        return new JournalDB();
      case DatabaseFactory.Names.CIRCUIT:
        return new CircuitDB();
      case DatabaseFactory.Names.TEAM:
        return new TeamDB();
      default:
        throw new Error("Unknown database type '" + name + "'");
    }
  }
};
