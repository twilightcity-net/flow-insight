const isDev = require("electron-is-dev");

module.exports = class AppConfig {

  static appType = AppConfig.AppType.FLOW_INSIGHT;

  static activeToggles = {};

  static appName = AppConfig.appType;
  static version = "0.7.43"

  static defaultApiUrl = "https://home.twilightcity.net";
  static defaultTalkUrl = "https://talk.twilightcity.net";

  /**
   * the applications name
   * @returns {string}
   */
  static getAppName() {
    return AppConfig.appName;
  }

  /**
   * gets the api url to use
   * @returns {string}
   */
  static getAppApi() {
    let url = AppConfig.defaultApiUrl;
    if (isDev) {
      process.argv.forEach(function (val, index, array) {
        if (val.toLowerCase().startsWith("server=")) {
          url = val.toLowerCase().substring(7);
        }
      });
    }
    return url;
  }

  /**
   * gets the url of the Talknet Server. returns localhost if it is local
   * @returns {string}
   */
  static getAppTalkUrl() {
    let url = AppConfig.defaultTalkUrl;
    if (isDev) {
      process.argv.forEach((val) => {
        if (val.toLowerCase().startsWith("talk=")) {
          url = val.toLowerCase().substring(5);
        }
      });
    }
    return url;
  }


  static isFerviePopupEnabled() {
    return AppConfig.isEnabled(AppConfig.Toggle.FERVIE);
  }

  static isStatusBarEnabled() {
    return  AppConfig.isEnabled(AppConfig.Toggle.STATUS);
  }

  static isMoovieApp() {
    return AppConfig.appType === AppConfig.AppType.WATCH_MOOVIES;
  }

  static isEnabled(featureToggle) {
    return AppConfig.activeToggles[featureToggle];
  }

  static isConsoleWindowedInDockMode() {
    return true;
  }


  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      FERVIE_WELCOME: "fervie-welcome",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      CONTROL: "control",
      TOOLS: "tools",
      ARDEVICE: "ardevice",
      STATUS: "status",
      INDIVIDUAL: "individual",
      PAIRING: "pairing"
    };
  }

  static get AppType() {
    return {
      FLOW_INSIGHT: "FlowInsight",
      WATCH_MOOVIES: "WatchMoovies",
      FLOW_JOURNAL: "FlowJournal"
    };
  }

  static init(featureToggleList) {
    for (let featureKey in AppConfig.Toggle) {
      AppConfig.activeToggles[AppConfig.Toggle[featureKey]] = false;
    }

    for (let enabledToggle of featureToggleList) {
      AppConfig.activeToggles[enabledToggle] = true;
    }

    console.log("UPDATED TOGGLES!");
    console.log(AppConfig.activeToggles);

  }

}
