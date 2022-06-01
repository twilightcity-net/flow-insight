
module.exports = class AppFeatureToggle {

  static isMoovieApp = false;

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
