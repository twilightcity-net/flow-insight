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

  /// verifies that the settings file exists
  check() {
    log.info("[AppSettings] check path -> " + this.path);
    if (fs.existsSync(this.path)) {
      log.info("[AppSettings] has settings -> true");
      return true;
    }
    log.info("[AppSettings] has settings -> false");
    return false;
  }

  /// sets and encrypts the api key that is set by the activator
  setApiKey(value) {
    log.info("[AppSettings] save api key");
    let cipher = crypto.AES.encrypt(value, this.keyToken).toString();
    settings.set(AppSettings.Keys.APP_API_KEY, cipher);

    let flowHome = Util.getFlowHomePath() ;
    log.info("[AppSettings] flow home path -> " + flowHome);

    fs.mkdir(flowHome);
    fs.writeFile(flowHome + "/api.key", value );
  }

  /// decrypts and returns the stored api key in settings
  getApiKey() {
    log.info("[AppSettings] get api key");
    let key = settings.get(AppSettings.Keys.APP_API_KEY);
    if (key) {
      let bytes = crypto.AES.decrypt(key, this.keyToken);
      return bytes.toString(crypto.enc.Utf8);
    }
    return null;
  }

  deleteSettings() {
    log.info("[AppSettings] delete settings");
    if (this.check()) {
      fs.unlinkSync(this.path, err => {
        throw err;
      });
    }
  }

  /// enum map of possible settings key pairs
  static get Keys() {
    return {
      APP_API_KEY: "app.api.key"
    };
  }
};
