
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static appName = "FlowInsight";

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
