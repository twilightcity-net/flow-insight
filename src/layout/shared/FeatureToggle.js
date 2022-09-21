export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static appName = "FlowInsight";
  static version = "0.5.27"

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

}
