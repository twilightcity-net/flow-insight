
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFerviePopupEnabled = true;

  static isToolsExtensionEnabled = false;

  static isARDeviceEnabled = false;

  static appName = "FlowInsight";
  static version = "0.5.35"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      MOOVIES: "moovies",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      TOOLS: "tools",
      ARDEVICE: "ardevice"
    };
  }

  static init(featureToggleList) {
    AppFeatureToggle.isFerviePopupEnabled = false;
    AppFeatureToggle.isMoovieApp = false;
    AppFeatureToggle.isToolsExtensionEnabled = false;
    AppFeatureToggle.isARDeviceEnabled = false;

    for (let toggle of featureToggleList) {
      if (toggle === AppFeatureToggle.Toggle.FERVIE) {
        AppFeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.MOOVIES) {
        AppFeatureToggle.isMoovieApp = true;
        AppFeatureToggle.appName = "WatchMoovies";
      }
      if (toggle === AppFeatureToggle.Toggle.TOOLS) {
        AppFeatureToggle.isToolsExtensionEnabled = true;
      }

      if (toggle === AppFeatureToggle.Toggle.ARDEVICE) {
        AppFeatureToggle.isARDeviceEnabled = true;
      }
    }
  }

}
