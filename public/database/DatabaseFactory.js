const TalkDB = require("./TalkDatabase"),
  JournalDB = require("./JournalDatabase"),
  CircuitDB = require("./CircuitDatabase"),
  TeamDB = require("./TeamDatabase"),
  MemberDB = require("./MemberDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
module.exports = class DatabaseFactory {
  /**
   * the names of our databases
   * @returns {{JOURNAL: string, TEAM: string, TALK: string, CIRCUIT: string, MEMBER: string}}
   * @constructor
   */
  static get Names() {
    return {
      TALK: "talk",
      JOURNAL: "journal",
      CIRCUIT: "circuit",
      TEAM: "team",
      MEMBER: "member"
    };
  }

  /**
   * creates our in memonic (in-memory) database and return it. These things have about a 250k document limit at about
   * 1.4GB. Max size is about ~4.2GB which hits your local floating point indexs.. This creates weird behavior in which
   * multiple indices reference multiple unrelated things.. Long story, try to spawn and manage hierarchial data via
   * the tree of a loki db.
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
};
