const { app } = require("electron"),
  settings = require("electron-settings"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  fs = require("fs"),
  crypto = require("crypto-js"),
  Util = require("../Util");

//
// Application class that manages our settings
//
module.exports = class AppSettings {
  constructor() {
    if (isDev) {
      let devPath = Util.getDevSettingsPath();
      log.info("[AppSettings] set dev path -> " + devPath);
      settings.setPath(devPath);
    }
    this.path = settings.file();
    this.keyToken = "70rCh13 L0v3";
    log.info("[AppSettings] load settings -> " + this.path);
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

  setApiKey(value) {
    let cipher = crypto.AES.encrypt(value, this.keyToken).toString();
    settings.set(AppSettings.Keys.APP_API_KEY, cipher);
  }

  getApiKey() {
    let key = settings.get(AppSettings.Keys.APP_API_KEY),
      bytes = crypto.AES.decrypt(key, this.keyToken);
    return bytes.toString(crypto.enc.Utf8);
  }

  /// enum map of possible settings key pairs
  static get Keys() {
    return {
      APP_API_KEY: "app.api.key"
    };
  }
};
