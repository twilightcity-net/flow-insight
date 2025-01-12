export default class FeatureToggle  {

  static appType = FeatureToggle.AppType.FLOW_INSIGHT;

  static activeToggles = {};

  static appName = FeatureToggle.appType;
  static version = "0.7.43"

  static isEnabled(featureToggle) {
    return FeatureToggle.activeToggles[featureToggle];
  }

  static isPairingEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.PAIRING);
  }

  static isJournalEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.JOURNAL);
  }

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp();
  }

  static isNeoMode() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.NEO);
  }

  static isMetricsEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.METRICS);
  }

  static isPersonalDashboardEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.DASHBOARD);
  }

  static isControlChartEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.CONTROL);
  }

  static isIndividualModeEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.INDIVIDUAL);
  }

  static isFervieWelcomeEnabled() {
    return FeatureToggle.isEnabled(FeatureToggle.Toggle.FERVIE_WELCOME);
  }

  static isMoovieApp() {
    return FeatureToggle.appType === FeatureToggle.AppType.WATCH_MOOVIES;
  }

  static get Toggle() {
    return {
      JOURNAL: "journal",
      FERVIE: "fervie",
      FERVIE_WELCOME: "fervie-welcome",
      NEO: "neo",
      METRICS: "metrics",
      DASHBOARD: "dashboard",
      CONTROL: "control",
      TOOLS: "tools",
      ARDEVICE: "ardevice",
      STATUS: "status",
      INDIVIDUAL: "individual",
      PAIRING: "pairing"
    };
  }

  static get AppType() {
    return {
      FLOW_INSIGHT: "FlowInsight",
      WATCH_MOOVIES: "WatchMoovies",
      FLOW_JOURNAL: "FlowJournal"
    };
  }

  static init(featureToggleList) {
    for (let featureKey in FeatureToggle.Toggle) {
      FeatureToggle.activeToggles[FeatureToggle.Toggle[featureKey]] = false;
    }

    for (let enabledToggle of featureToggleList) {
      FeatureToggle.activeToggles[enabledToggle] = true;
    }

    console.log("UPDATED TOGGLES!");
    console.log(FeatureToggle.activeToggles);
  }

}
