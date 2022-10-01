export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static isJournalEnabled = false;

  static appName = "FlowInsight";
  static version = "0.5.27"

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      MOOVIES: "moovies"
    };
  }

  static init(featureToggleList) {
    FeatureToggle.isJournalEnabled = false;
    FeatureToggle.isFerviePopupEnabled = false;
    FeatureToggle.isMoovieApp = false;

    for (let toggle of featureToggleList) {
      if (toggle === FeatureToggle.Toggle.JOURNAL) {
        FeatureToggle.isJournalEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.FERVIE) {
        FeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.MOOVIES) {
        FeatureToggle.isMoovieApp = true;
        FeatureToggle.appName = "WatchMoovies";
      }
    }
  }

}
