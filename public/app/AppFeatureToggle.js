
module.exports = class AppFeatureToggle {

  static isMoovieApp = true;
  static consoleHasWindowInDock = true;

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
