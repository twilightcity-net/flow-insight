
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFerviePopupEnabled = true;

  static isFervieWelcomeEnabled = false;

  static isToolsExtensionEnabled = false;

  static isControlChartEnabled = false;

  static isStatusBarEnabled = false;

  static isIndividualModeEnabled = false;


  static appName = "FlowInsight";
  static version = "0.7.12"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      FERVIE_WELCOME: "fervie-welcome",
      MOOVIES: "moovies",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      CONTROL: "control",
      TOOLS: "tools",
      ARDEVICE: "ardevice",
      STATUS: "status",
      INDIVIDUAL: "individual"
    };
  }

  static init(featureToggleList) {
    AppFeatureToggle.isFerviePopupEnabled = false;
    AppFeatureToggle.isFervieWelcomeEnabled = false;
    AppFeatureToggle.isMoovieApp = false;
    AppFeatureToggle.isToolsExtensionEnabled = false;
    AppFeatureToggle.isStatusBarEnabled = false;
    AppFeatureToggle.isControlChartEnabled = false;
    AppFeatureToggle.isIndividualModeEnabled = false;

    for (let toggle of featureToggleList) {
      if (toggle === AppFeatureToggle.Toggle.FERVIE) {
        AppFeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.FERVIE_WELCOME) {
        AppFeatureToggle.isFervieWelcomeEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.MOOVIES) {
        AppFeatureToggle.isMoovieApp = true;
        AppFeatureToggle.appName = "WatchMoovies";
      }
      if (toggle === AppFeatureToggle.Toggle.TOOLS) {
        AppFeatureToggle.isToolsExtensionEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.STATUS) {
        AppFeatureToggle.isStatusBarEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.CONTROL) {
        AppFeatureToggle.isControlChartEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.INDIVIDUAL) {
        AppFeatureToggle.isIndividualModeEnabled = true;
      }
    }
  }

}
