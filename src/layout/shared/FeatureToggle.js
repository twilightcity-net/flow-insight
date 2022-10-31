export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static isJournalEnabled = false;

  static isNeoMode = false;

  static isMetricsEnabled = false;

  static appName = "FlowInsight";
  static version = "0.5.28"

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      MOOVIES: "moovies",
      NEO: "neo",
      METRICS: "metrics"
    };
  }

  static init(featureToggleList) {
    FeatureToggle.isJournalEnabled = false;
    FeatureToggle.isFerviePopupEnabled = false;
    FeatureToggle.isMoovieApp = false;
    FeatureToggle.isNeoMode = false;
    FeatureToggle.isMetricsEnabled = false;

    console.log("UPDATING TOGGLES!");
    console.log(featureToggleList);

    for (let toggle of featureToggleList) {
      if (toggle === FeatureToggle.Toggle.JOURNAL) {
        FeatureToggle.isJournalEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.FERVIE) {
        FeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.NEO) {
        FeatureToggle.isNeoMode = true;
      }
      if (toggle === FeatureToggle.Toggle.METRICS) {
        FeatureToggle.isMetricsEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.MOOVIES) {
        FeatureToggle.isMoovieApp = true;
        FeatureToggle.appName = "WatchMoovies";
      }
    }
  }

}
