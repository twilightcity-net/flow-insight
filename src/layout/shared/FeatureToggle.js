export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static isJournalEnabled = false;

  static isNeoMode = false;

  static isMetricsEnabled = false;

  static isToolsExtensionEnabled = false;

  static isPersonalDashboardEnabled = false;

  static appName = "FlowInsight";
  static version = "0.5.35"

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      MOOVIES: "moovies",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      TOOLS: "tools"
    };
  }

  static init(featureToggleList) {
    FeatureToggle.isJournalEnabled = false;
    FeatureToggle.isFerviePopupEnabled = false;
    FeatureToggle.isMoovieApp = false;
    FeatureToggle.isNeoMode = false;
    FeatureToggle.isMetricsEnabled = false;
    FeatureToggle.isToolsExtensionEnabled = false;
    FeatureToggle.isPersonalDashboardEnabled = false;

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
      if (toggle === FeatureToggle.Toggle.DASHBOARD) {
        FeatureToggle.isPersonalDashboardEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.MOOVIES) {
        FeatureToggle.isMoovieApp = true;
        FeatureToggle.appName = "WatchMoovies";
      }
      if (toggle === FeatureToggle.Toggle.TOOLS) {
        FeatureToggle.isToolsExtensionEnabled = true;
      }
    }
  }

}
