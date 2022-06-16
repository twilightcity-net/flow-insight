
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;
  static consoleHasWindowInDock = true;

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
