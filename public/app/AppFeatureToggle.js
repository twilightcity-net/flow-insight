
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFerviePopupEnabled = true;

  static appName = "FlowInsight";
  static version = "0.5.26"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
