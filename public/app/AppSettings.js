let settings = require("electron-settings"),
  log = require("electron-log"),
  fs = require("fs"),
  crypto = require("crypto-js"),
  Util = require("../Util"),
  AppError = require("./AppError"),
  { ShortcutManager } = require("../managers/ShortcutManager");

/**
 * Application class used to manage our settings stores in ~/.flow
 * @class AppSettings
 * @type {module.App.AppSettings}
 */

// FIXME the crypto is disabled as its not working with java to decode it

module.exports = class AppSettings {
  /**
   * Represent a group of Settings
   * @constructor
   */
  constructor() {
    let flowPath = this.getOrCreateFlowHomeDir();
    let path = Util.getAppSettingsPath();
    log.info("[AppSettings] set paths -> " + flowPath + " : " + path);
    settings.setPath(path);
    this.path = settings.file();

    // TODO implement this to store the key https://stackoverflow.com/questions/6226189/how-to-convert-a-string-to-bytearray

    this.keyToken = "70rCh13 L0v3";
    log.info("[AppSettings] load settings -> " + this.path);
  }

  /**
   * Verifies the path of the settings
   * @returns {boolean}
   */
  check() {
    let path = Util.getAppSettingsPath();
    log.info("[AppSettings] check path -> " + path);
    if (fs.existsSync(path) && this.verify()) {
      log.info("[AppSettings] has settings -> true");
      return true;
    }
    log.info("[AppSettings] has settings -> false");
    return false;
  }

  /**
   * sets and encrypts the api key that is set by the activator
   * @param apiUrl
   * @param apiKey
   */
  save(apiUrl, apiKey) {
    // let apiKeyCrypted = crypto.AES.encrypt(apiKey, this.keyToken).toString();

    log.info("[AppSettings] save api key and url", apiUrl, apiKey);
    settings.set(AppSettings.Keys.APP_API_URL, apiUrl);
    settings.set(AppSettings.Keys.APP_API_KEY, apiKey);
    this.setDisplayIndex(AppSettings.DefaultValues.DISPLAY_INDEX);
    this.setConsoleShortcut(AppSettings.DefaultValues.CONSOLE_SHORTCUT);
    this.setConsoleShortcutAlt(AppSettings.DefaultValues.CONSOLE_SHORTCUT_ALT);
  }

  /**
   * gets the .flow directory in the users directory, or creates it if it doesn't exist
   * @returns {*}
   */
  getOrCreateFlowHomeDir() {
    let path = Util.getFlowHomePath();

    try {
      fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
      fs.mkdirSync(path);
    }
    return path;
  }

  /**
   * decrypts and returns the stored api key in settings
   * @returns {string|null}
   */
  getApiKey() {
    log.info("[AppSettings] get api key");
    let key = settings.get(AppSettings.Keys.APP_API_KEY);
    return key;
    // if (key) {
    //   let bytes = crypto.AES.decrypt(key, this.keyToken);
    //   return bytes.toString(crypto.enc.Utf8);
    // }
    // return null;
  }

  /**
   * gets which display to show the console on
   * @returns {any}
   */
  getDisplayIndex() {
    return settings.get(AppSettings.Keys.DISPLAY_INDEX);
  }

  /**
   * stores which display we wish to show the console on
   * @param index
   */
  setDisplayIndex(index) {
    settings.set(AppSettings.Keys.DISPLAY_INDEX, index);
  }

  /**
   * gets the hotkey accelerator string that represents the show console
   * global shortcut
   * @returns {any}
   */
  getConsoleShortcut() {
    let shortcut = settings.get(AppSettings.Keys.CONSOLE_SHORTCUT);
    if (!shortcut) {
      shortcut = ShortcutManager.Accelerators.CONSOLE_SHORTCUT;
      this.setConsoleShortcut(shortcut);
    }
    return shortcut;
  }

  /**
   * stores the global shortcut for showing the console window
   * @param shortcut
   */
  setConsoleShortcut(shortcut) {
    settings.set(AppSettings.Keys.CONSOLE_SHORTCUT, shortcut);
  }

  /**
   * gets the alternatate shortcut to display the console
   * @returns {any}
   */
  getConsoleShortcutAlt() {
    let shortcut = settings.get(AppSettings.Keys.CONSOLE_SHORTCUT_ALT);
    if (!shortcut) {
      shortcut = ShortcutManager.Accelerators.CONSOLE_SHORTCUT_ALT;
      this.setConsoleShortcutAlt(shortcut);
    }
    return shortcut;
  }

  /**
   * stores the global alt shortcut for showing the console window
   * @param shortcut
   */
  setConsoleShortcutAlt(shortcut) {
    settings.set(AppSettings.Keys.CONSOLE_SHORTCUT_ALT, shortcut);
  }

  /**
   * verifies the actual settings in the file are what they are
   * @returns {boolean}
   */
  verify() {
    let keys = Object.values(AppSettings.Keys),
      len = keys.length,
      i = 0;
    for (i = 0; i < len; i++) {
      if (!settings.has(keys[i])) {
        log.info("[AppSettings] verify settings -> failed : " + keys[i]);
        return false;
      } else if (
        keys[i] === AppSettings.Keys.APP_API_KEY &&
        settings.get(AppSettings.Keys.APP_API_KEY) &&
        settings.get(AppSettings.Keys.APP_API_KEY).length !== 32
      ) {
        log.info("[AppSettings] verify api key -> failed : invalid");
        return false;
      }
    }
    log.info("[AppSettings] verify settings -> okay");
    return true;
  }

  /**
   * gets the default valuees for the shortcuts
   * @returns {{CONSOLE_SHORTCUT_ALT: (string), DISPLAY_INDEX: number, CONSOLE_SHORTCUT: string}}
   * @constructor
   */
  static get DefaultValues() {
    return {
      DISPLAY_INDEX: 0,
      CONSOLE_SHORTCUT: ShortcutManager.Accelerators.CONSOLE_SHORTCUT,
      CONSOLE_SHORTCUT_ALT: ShortcutManager.Accelerators.CONSOLE_SHORTCUT_ALT
    };
  }

  /**
   * enum map of possible settings key pairs
   * @returns {{APP_API_KEY: string}}
   * @constructor
   */
  static get Keys() {
    return {
      APP_API_URL: "apiUrl",
      APP_API_KEY: "apiKey",
      DISPLAY_INDEX: "displayIndex",
      CONSOLE_SHORTCUT: "shortcutConsole",
      CONSOLE_SHORTCUT_ALT: "shortcutConsoleAlt"
    };
  }
};
