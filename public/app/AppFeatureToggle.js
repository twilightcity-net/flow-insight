
module.exports = class AppFeatureToggle {

  static appType = AppFeatureToggle.AppType.FLOW_INSIGHT;

  static activeToggles = {};

  static appName = AppFeatureToggle.appType;
  static version = "0.7.43"

  static isFerviePopupEnabled() {
    return AppFeatureToggle.isEnabled(AppFeatureToggle.Toggle.FERVIE);
  }

  static isStatusBarEnabled() {
    return  AppFeatureToggle.isEnabled(AppFeatureToggle.Toggle.STATUS);
  }

  static isMoovieApp() {
    return AppFeatureToggle.appType === AppFeatureToggle.AppType.WATCH_MOOVIES;
  }

  static isEnabled(featureToggle) {
    return AppFeatureToggle.activeToggles[featureToggle];
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
    for (let featureKey in AppFeatureToggle.Toggle) {
      AppFeatureToggle.activeToggles[AppFeatureToggle.Toggle[featureKey]] = false;
    }

    for (let enabledToggle of featureToggleList) {
      AppFeatureToggle.activeToggles[enabledToggle] = true;
    }

    console.log("UPDATED TOGGLES!");
    console.log(AppFeatureToggle.activeToggles);

  }

}
