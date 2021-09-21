const { dialog } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  chalk = require("chalk"),
  cleanStack = require("clean-stack"),
  stackTrace = require("stack-trace"),
  isDev = require("electron-is-dev");

/**
 * Base Exception class for app, all other errors should extend this
 * @type {AppError}
 */
module.exports = class AppError extends Error {
  constructor(..._) {
    super(..._);
    this.name = "AppError";
    this.date = new Date();
    this.stack = cleanStack(this.stack);
  }

  static handleError(error, fatal, graceful, stacetrace) {
    if (isDev) graceful = true;
    if (!(error instanceof AppError)) {
      if (error.stack === "undefined" || null || "") {
        error.stack = stackTrace.get();
      } else {
        error.stack = cleanStack(error.stack);
      }
    }
    if (global.App) {
      if (stacetrace) {
        log.error(
          chalk.red((fatal ? "[FATAL] " : "") + "[App] ") +
            error.toString() +
            "\n\n" +
            error.stack +
            "\n"
        );
      } else {
        log.error(
          chalk.red((fatal ? "[FATAL] " : "") + "[App] ") +
            error.toString() +
            "\n\n" +
            error.stack +
            "\n"
        );
      }
    } else {
      console.error(
        (fatal ? "[FATAL] " : "") +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
    }
    if (fatal) {
      dialog.showErrorBox(
        "Twilight City",
        "[FATAL] " + error.toString()
      );
      process.exit(1);
    } else if (!graceful) {
      dialog.showErrorBox(
        "Twilight City",
        error.toString()
      );
    }
  }

  /*
   * returns the error in string format
   */
  toString() {
    return (
      "[" +
      this.name +
      " :: " +
      this.message +
      " @ " +
      Util.getDateTimeString(this.date) +
      "]"
    );
  }
};
