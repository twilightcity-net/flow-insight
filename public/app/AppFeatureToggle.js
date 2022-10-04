
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFerviePopupEnabled = true;

  static appName = "FlowInsight";
  static version = "0.5.27"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      MOOVIES: "moovies",
      NEO: "neo"
    };
  }

  static init(featureToggleList) {
    AppFeatureToggle.isFerviePopupEnabled = false;
    AppFeatureToggle.isMoovieApp = false;

    for (let toggle of featureToggleList) {
      if (toggle === AppFeatureToggle.Toggle.FERVIE) {
        AppFeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === AppFeatureToggle.Toggle.MOOVIES) {
        AppFeatureToggle.isMoovieApp = true;
        AppFeatureToggle.appName = "WatchMoovies";
      }
    }
  }

}
