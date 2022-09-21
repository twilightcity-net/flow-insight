
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFerviePopupEnabled = true;

  static appName = "FlowInsight";
  static version = "0.5.27"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
