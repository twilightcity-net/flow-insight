export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static appName = "FlowInsight";

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

}
