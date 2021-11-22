const TalkDB = require("./TalkDatabase"),
  JournalDB = require("./JournalDatabase"),
  CircuitDB = require("./CircuitDatabase"),
  TeamDB = require("./TeamDatabase"),
  MemberDB = require("./MemberDatabase"),
  DictionaryDB = require("./DictionaryDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
class DatabaseFactory {
  /**
   * the names of our databases
   * @returns {{JOURNAL: string, TEAM: string, TALK: string, CIRCUIT: string, MEMBER: string, DICTIONARY: string}}
   * @constructor
   */
  static get Names() {
    return {
      TALK: "talk",
      JOURNAL: "journal",
      CIRCUIT: "circuit",
      TEAM: "team",
      MEMBER: "member",
      DICTIONARY: "dictionary",
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
      case DatabaseFactory.Names.MEMBER:
        return new MemberDB();
      case DatabaseFactory.Names.DICTIONARY:
        return new DictionaryDB();
      default:
        throw new Error(
          "Unknown database type '" + name + "'"
        );
    }
  }

  /**
   * gets our database in our memory from what we created
   * @param name
   * @returns {*}
   */
  static getDatabase(name) {
    return global.App.VolumeManager.getVolumeByName(name);
  }
}

module.exports = DatabaseFactory;
