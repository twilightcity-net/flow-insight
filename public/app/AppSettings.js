let settings = require("electron-settings"),
  log = require("electron-log"),
  fs = require("fs"),
  crypto = require("crypto-js"),
  Util = require("../Util"),
  AppError = require("./AppError"),
  {
    ShortcutManager,
  } = require("../managers/ShortcutManager");
const AppFeatureToggle = require("./AppFeatureToggle");

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
    log.info(
      "[AppSettings] set paths -> " +
        flowPath +
        " : " +
        path
    );

    log.info("configuring settings");

    settings.setPath(Util.getAppSettingsPath());

    // settings.configure({
    //   dir: Util.getFlowHomePath(),
    //   fileName: Util.getSettingsFileName()
    // });
    this.path = settings.file();

    // TODO implement this to store the key https://stackoverflow.com/questions/6226189/how-to-convert-a-string-to-bytearray

    this.keyToken = "70rCh13 L0v3";
    log.info("[AppSettings] load settings -> " + this.path);
  }

  static EMPTY_SETTING = "[empty]";

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
   * Toggle the feature on or off, depending on it's existing state in settings
   * @param featureName
   */
  toggleFeature(featureName) {
    let toggles = this.getFeatureToggles();
    for (let i = 0; i < toggles.length; i++) {
      const toggle = toggles[i];
      if (featureName === toggle) {
        toggles.splice(i, 1);
        return this.saveFeatureToggles(toggles);
      }
    }
    toggles.push(featureName);
    return this.saveFeatureToggles(toggles);
  }


  /**
   * Toggle feature on if it's off
   * @param featureName
   */
  toggleOnFeature(featureName) {
    let toggles = this.getFeatureToggles();
    toggles = this.removeFeatureFromListIfPresent(toggles, featureName);

    toggles.push(featureName);
    return this.saveFeatureToggles(toggles);
  }

  /**
   * Toggle feature off if it's on
   * @param featureName
   */
  toggleOffFeature(featureName) {
    let toggles = this.getFeatureToggles();
    toggles = this.removeFeatureFromListIfPresent(toggles, featureName);

    return this.saveFeatureToggles(toggles);
  }

  /**
   * Remove a toggle from the supplied list if it's present
   * @param toggles
   * @param featureName
   */
  removeFeatureFromListIfPresent(toggles, featureName) {
    for (let i = 0; i < toggles.length; i++) {
      const toggle = toggles[i];
      if (featureName === toggle) {
        toggles.splice(i, 1);
        break;
      }
    }
    return toggles;
  }

  /**
   * Saves the specified feature toggle list to our updated toggles list
   * @param toggleList
   */
  saveFeatureToggles(toggleList) {
    let commaList = this.arrayToCommaList(toggleList);
    if (commaList === "") {
      commaList = AppSettings.EMPTY_SETTING;
    }
    settings.set(AppSettings.OptionalKeys.FEATURE_TOGGLE_LIST, commaList);

    return toggleList;
  }

  /**
   * Get all the current feature toggles saved in settings
   */
  getFeatureToggles() {
    let commaSeparatedToggles = settings.get(AppSettings.OptionalKeys.FEATURE_TOGGLE_LIST);
    if (commaSeparatedToggles) {
      return this.commaListToArray(commaSeparatedToggles);
    } else {
      return this.getDefaultFeatureToggles();
    }
  }

  getDefaultFeatureToggles() {
    return [
      AppFeatureToggle.Toggle.METRICS,
      AppFeatureToggle.Toggle.STATUS,
      AppFeatureToggle.Toggle.DASHBOARD,
      AppFeatureToggle.Toggle.CONTROL
    ];
  }

  /**
   * Converts a comma separated value list to an array
   * @param commaList
   */
  commaListToArray(commaList) {
    const trimArray = [];
    const arr = commaList.split(",");
    for (let item of arr) {
      trimArray.push(item.trim());
    }
    if (trimArray.length === 1 && trimArray[0] === AppSettings.EMPTY_SETTING) {
      return [];
    } else {
      return trimArray;
    }
  }

  /**
   * Converts an array to a comma separated value list
   * @param array
   */
  arrayToCommaList(array) {
    let commaList = array.join(",");
    console.log(commaList);
    return commaList;
  }

  /**
   * sets and encrypts the api key that is set by the activator
   * @param apiUrl
   * @param apiKey
   */
  save(apiUrl, apiKey) {
    // let apiKeyCrypted = crypto.AES.encrypt(apiKey, this.keyToken).toString();

    settings.set(AppSettings.Keys.APP_API_URL, apiUrl);
    settings.set(AppSettings.Keys.APP_API_KEY, apiKey);
    this.setDisplayIndex(
      AppSettings.DefaultValues.DISPLAY_INDEX
    );
    this.setConsoleShortcut(
      AppSettings.DefaultValues.CONSOLE_SHORTCUT
    );
    this.setConsoleShortcutAlt(
      AppSettings.DefaultValues.CONSOLE_SHORTCUT_ALT
    );
  }

  /**
   * gets the .flow directory in the users directory, or creates it if it doesn't exist
   * @returns {*}
   */
  getOrCreateFlowHomeDir() {
    let path = Util.getFlowHomePath();

    try {
      fs.accessSync(
        path,
        fs.constants.R_OK | fs.constants.W_OK
      );
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
      shortcut =
        ShortcutManager.Accelerators.CONSOLE_SHORTCUT;
      this.setConsoleShortcut(shortcut);
    }
    return shortcut;
  }

  /**
   * stores the global shortcut for showing the console window
   * @param shortcut
   */
  setConsoleShortcut(shortcut) {
    settings.set(
      AppSettings.Keys.CONSOLE_SHORTCUT,
      shortcut
    );
  }

  /**
   * stores the global shortcut for calling your fervie
   * @param shortcut
   */
  setFervieShortcut(shortcut) {
    settings.set(
      AppSettings.OptionalKeys.FERVIE_SHORTCUT,
      shortcut
    );
  }

  /**
   * gets the hotkey accelerator string that represents the fervie call
   * global shortcut
   * @returns {any}
   */
  getFervieShortcut() {
    let shortcut = settings.get(AppSettings.Keys.FERVIE_SHORTCUT);
    if (!shortcut) {
      shortcut = ShortcutManager.Accelerators.FERVIE_SHORTCUT;
      this.setFervieShortcut(shortcut);
    }
    return shortcut;
  }

  /**
   * gets the alternatate shortcut to display the console
   * @returns {any}
   */
  getConsoleShortcutAlt() {
    let shortcut = settings.get(
      AppSettings.Keys.CONSOLE_SHORTCUT_ALT
    );
    if (!shortcut) {
      shortcut =
        ShortcutManager.Accelerators.CONSOLE_SHORTCUT_ALT;
      this.setConsoleShortcutAlt(shortcut);
    }
    return shortcut;
  }

  /**
   * stores the global alt shortcut for showing the console window
   * @param shortcut
   */
  setConsoleShortcutAlt(shortcut) {
    settings.set(
      AppSettings.Keys.CONSOLE_SHORTCUT_ALT,
      shortcut
    );
  }

  /**
   * stores an optional primary orgId for logging in
   * @param primaryOrgId
   */
  setPrimaryOrganizationId(primaryOrgId) {
    if (AppFeatureToggle.isMoovieApp) {
      settings.set(
        AppSettings.OptionalKeys.PRIMARY_ORG_ID_APP_WATCHMOOVIES,
        primaryOrgId
      );
    } else {
      settings.set(
        AppSettings.OptionalKeys.PRIMARY_ORG_ID_APP_FLOWINSIGHT,
        primaryOrgId
      );
    }
  }

  /**
   * Retrieves an optional primary orgId for logging in
   */
  getPrimaryOrganizationId() {
    let orgId;
    if (AppFeatureToggle.isMoovieApp) {
      orgId = settings.get(AppSettings.OptionalKeys.PRIMARY_ORG_ID_APP_WATCHMOOVIES);
    } else {
      orgId = settings.get(AppSettings.OptionalKeys.PRIMARY_ORG_ID_APP_FLOWINSIGHT);
    }
    if (!orgId) {
      orgId = null;
    }

    return orgId;
  }

  /**
   * stores an optional active metric set
   * @param metricSet
   */
  setActiveMetricSet(metricSet) {
    settings.set(AppSettings.OptionalKeys.ACTIVE_METRIC_SET, metricSet);
  }

  /**
   * Retrieves an optional active metric set
   */
  getActiveMetricSet() {
    return settings.get(AppSettings.OptionalKeys.ACTIVE_METRIC_SET);
  }


  /**
   * verifies the actual settings in the file are what they are
   * @returns {boolean}
   */
  verify() {
    let keys = Object.values(AppSettings.Keys);

    for (let i = 0; i < keys.length; i++) {
      if (!settings.has(keys[i])) {
        log.info(
          "[AppSettings] verify settings -> failed : " +
            keys[i]
        );
        return false;
      } else {
        if (
          keys[i] === AppSettings.Keys.APP_API_KEY &&
          settings.get(AppSettings.Keys.APP_API_KEY) &&
          settings.get(AppSettings.Keys.APP_API_KEY)
            .length !== 32
        ) {
          log.info(
            "[AppSettings] verify api key -> failed : invalid"
          );
          return false;
        }
      }
    }
    log.info("[AppSettings] verify settings -> okay");
    return true;
  }

  /**
   * gets the default valuees for the shortcuts
   * @constructor
   */
  static get DefaultValues() {
    return {
      DISPLAY_INDEX: 0,
      CONSOLE_SHORTCUT: ShortcutManager.Accelerators.CONSOLE_SHORTCUT,
      CONSOLE_SHORTCUT_ALT: ShortcutManager.Accelerators.CONSOLE_SHORTCUT_ALT,
      FERVIE_SHORTCUT: ShortcutManager.Accelerators.FERVIE_SHORTCUT,
    };
  }

  /**
   * enum map of possible settings key pairs
   * @constructor
   */
  static get Keys() {
    return {
      APP_API_URL: "apiUrl",
      APP_API_KEY: "apiKey",
      DISPLAY_INDEX: "displayIndex",
      CONSOLE_SHORTCUT: "shortcutConsole",
      CONSOLE_SHORTCUT_ALT: "shortcutConsoleAlt",
    };
  }

  static get OptionalKeys() {
    return {
      PRIMARY_ORG_ID_APP_FLOWINSIGHT: "primaryOrgIdFlowInsight",
      PRIMARY_ORG_ID_APP_WATCHMOOVIES: "primaryOrgIdWatchMoovies",
      FERVIE_SHORTCUT: "shortcutFervie",
      FEATURE_TOGGLE_LIST: "featureToggleList",
      ACTIVE_METRIC_SET: "activeMetricSet"
    };
  }
};
