const GLOBAL_ = global,
  { dialog } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  cleanStack = require("clean-stack");

/*
 * Base Exception class for app, all other errors should extend this
 */
module.exports = class AppError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "AppError";
    this.date = new Date();
    this.stack = cleanStack(this.stack);
  }

  static handleError(error, fatal) {
    if (!(error instanceof AppError)) {
      error.stack = cleanStack(error.stack);
    }
    if (GLOBAL_.App) {
      log.error(
        (fatal ? "[FATAL] " : "") +
          "[App] " +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
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
      dialog.showErrorBox("Torchie", "[FATAL] " + error.toString());
      process.exit(1);
    } else {
      dialog.showErrorBox("Torchie", error.toString());
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
