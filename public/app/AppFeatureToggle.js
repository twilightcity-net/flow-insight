
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static appName = "FlowInsight";
  static version = "0.5.23"

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
