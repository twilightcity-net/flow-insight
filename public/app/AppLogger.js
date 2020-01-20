const { app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log");

/*
 * This class is used to init the Logger
 */
module.exports = class Logger {
  static create() {
    let level = "info";
    if (isDev) {
      level = "debug";
      log.transports.file.file = `${path.join(
        app.getAppPath() + "/debug.log"
      )}`;
    }
    log.transports.file.level = level;
    log.transports.console.level = level;
    log.info("[Logger] initialized");
    return log;
  }
};
