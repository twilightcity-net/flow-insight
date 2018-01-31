const { app } = require("electron"),
  settings = require("electron-settings"),
  log = require("electron-log"),
  fs = require("fs");

//
// Application class that manages our settings
//
module.exports = class AppSettings {
  constructor() {
    this.path = settings.file();
    log.info("[AppSettings] load settings -> " + this.path);
    // settings.set('foo.bar', 'qux');
  }

  check() {
    log.info("[AppSettings] check path -> " + this.path);
    if (fs.existsSync(this.path)) {
      log.info("[AppSettings] has settings -> true");
      return true;
    }
    log.info("[AppSettings] has settings -> false");
    return false;
  }

  getSettings() {
    return settings;
  }
};
