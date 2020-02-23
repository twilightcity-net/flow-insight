const TalkDB = require("./TalkDB"),
  JournalDB = require("./JournalDB"),
  CircuitDB = require("./CircuitDB"),
  TeamDB = require("./TeamDB");

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
  static create(name) {
    switch (name) {
      case DatabaseFactory.Names.TALK:
        return new TalkDB();
      case DatabaseFactory.Names.JOURNAL:
        return new JournalDB();
      case DatabaseFactory.Names.CIRCUIT:
        return new CircuitDB();
      case DatabaseFactory.Names.TEAM:
        return new CircuitDB();
      default:
        throw new Error("Unknown database type '" + name + "'");
    }
  }
};
