const log = require("electron-log"),
  chalk = require("chalk");

/**
 * general purpose global utility functions for our Database
 * @type {Util}
 */
module.exports = class DatabaseUtil {
  /**
   * logs a database message with a fancy blue color
   * @param message
   * @param count
   */
  static log(message, count) {
    log.info(
      chalk.blueBright("[Database]") +
        " " +
        message +
        " : {" +
        count +
        "}"
    );
  }
};
