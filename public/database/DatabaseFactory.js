const TalkDB = require("./TalkDatabase"),
  JournalDB = require("./JournalDatabase"),
  CircuitDB = require("./CircuitDatabase"),
  TeamDB = require("./TeamDatabase"),
  BuddyDB = require("./BuddyDatabase"),
  MemberDB = require("./MemberDatabase"),
  NotificationDB = require("./NotificationDatabase"),
  DictionaryDB = require("./DictionaryDatabase"),
  DMDB = require("./DMDatabase"),
  EmojiDB = require("./EmojiDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
class DatabaseFactory {
  /**
   * the names of our databases
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
      NOTIFICATION: "notification",
      BUDDY: "buddy",
      DM: "dm",
      EMOJI: "emoji"
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
      case DatabaseFactory.Names.BUDDY:
        return new BuddyDB();
      case DatabaseFactory.Names.MEMBER:
        return new MemberDB();
      case DatabaseFactory.Names.DICTIONARY:
        return new DictionaryDB();
      case DatabaseFactory.Names.NOTIFICATION:
        return new NotificationDB();
      case DatabaseFactory.Names.DM:
        return new DMDB();
      case DatabaseFactory.Names.EMOJI:
        return new EmojiDB();
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
