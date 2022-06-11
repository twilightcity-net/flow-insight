
module.exports = class AppFeatureToggle {

  static isMoovieApp = true;

  static isFlowInsightApp() {
    return !AppFeatureToggle.isMoovieApp;
  }

}
