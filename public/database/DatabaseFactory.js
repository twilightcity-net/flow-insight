const LokiJS = require("lokijs"),
  Database = require("./MemonicDatabase");

/**
 * this class is used to build new databases
 * @type {DatabaseFactory}
 */
module.exports = class DatabaseFactory {
  static createDatabase(name, scope) {
    return new Database(name, scope);
  }
};
