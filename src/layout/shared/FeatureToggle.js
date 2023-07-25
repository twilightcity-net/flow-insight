export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static isJournalEnabled = false;

  static isNeoMode = false;

  static isMetricsEnabled = false;

  static isToolsExtensionEnabled = false;

  static isPersonalDashboardEnabled = false;

  static isControlChartEnabled = false;

  static isStatusBarEnabled = false;

  static isIndividualModeEnabled = false;

  static isFerviePopupEnabled = false;

  static isFervieWelcomeEnabled = false;


  static appName = "FlowInsight";
  static version = "0.7.12"

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      FERVIE_WELCOME: "fervie-welcome",
      MOOVIES: "moovies",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      CONTROL: "control",
      TOOLS: "tools",
      ARDEVICE: "ardevice",
      STATUS: "status",
      INDIVIDUAL: "individual"
    };
  }

  static init(featureToggleList) {
    FeatureToggle.isJournalEnabled = false;
    FeatureToggle.isFerviePopupEnabled = false;
    FeatureToggle.isFervieWelcomeEnabled = false;
    FeatureToggle.isMoovieApp = false;
    FeatureToggle.isNeoMode = false;
    FeatureToggle.isMetricsEnabled = false;
    FeatureToggle.isToolsExtensionEnabled = false;
    FeatureToggle.isPersonalDashboardEnabled = false;
    FeatureToggle.isStatusBarEnabled = false;
    FeatureToggle.isControlChartEnabled = false;
    FeatureToggle.isIndividualModeEnabled = false;

    console.log("UPDATING TOGGLES!");
    console.log(featureToggleList);

    for (let toggle of featureToggleList) {
      if (toggle === FeatureToggle.Toggle.JOURNAL) {
        FeatureToggle.isJournalEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.FERVIE) {
        FeatureToggle.isFerviePopupEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.FERVIE_WELCOME) {
        FeatureToggle.isFervieWelcomeEnabled = true;
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
      if (toggle === FeatureToggle.Toggle.CONTROL) {
        FeatureToggle.isControlChartEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.MOOVIES) {
        FeatureToggle.isMoovieApp = true;
        FeatureToggle.appName = "WatchMoovies";
      }
      if (toggle === FeatureToggle.Toggle.TOOLS) {
        FeatureToggle.isToolsExtensionEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.STATUS) {
        FeatureToggle.isStatusBarEnabled = true;
      }
      if (toggle === FeatureToggle.Toggle.INDIVIDUAL) {
        FeatureToggle.isIndividualModeEnabled = true;
      }
    }
  }

}
