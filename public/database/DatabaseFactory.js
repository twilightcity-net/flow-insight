const LokiJS = require("lokijs"),
  MemonicDatabase = require("./MemonicDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
module.exports = class DatabaseFactory {
  /**
   * creates our in memory database and return it
   * @param name
   * @param scope
   * @returns {DatabaseFactory}
   */
  static create(name, scope) {
    return new MemonicDatabase(name, scope);
  }
};
