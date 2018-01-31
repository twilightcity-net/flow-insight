const { app } = require("electron"),
  settings = require("electron-settings"),
  log = require("electron-log"),
  fs = require("fs");

//
// Application class that manages our settings
//
module.exports = class AppSettings {
  constructor() {
    let filePath = settings.file();
    log.info("[AppSettings] check for settings -> " + filePath);
    // settings.set('foo.bar', 'qux');
    if (fs.existsSync(filePath)) {
      log.info("[AppSettings] has settings -> true");
    } else {
      log.info("[AppSettings] has settings -> false");
    }
  }
};
