export default class FeatureToggle  {

  //TODO this appType logic is duplicated on the backend within AppConfig, these props should exist on the backend,
  // and be handed to the frontend so they're in one place.

  static appType = FeatureToggle.AppType.FLOW_INSIGHT;
  static appName = FeatureToggle.appType;
  static version = "0.7.43"



  static activeToggles = {};


  static isEnabled(featureToggle) {
    return FeatureToggle.activeToggles[featureToggle];
  }

  static isPairingEnabled() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.PAIRING);
  }

  static isJournalEnabled() {
    return FeatureToggle.isJournalApp() ||
      (FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.JOURNAL));
  }


  static isNeoMode() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.NEO);
  }

  static isMetricsEnabled() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.METRICS);
  }

  static isPersonalDashboardEnabled() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.DASHBOARD);
  }

  static isControlChartEnabled() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.CONTROL);
  }

  static isIndividualModeEnabled() {
    return FeatureToggle.isJournalApp() || FeatureToggle.isEnabled(FeatureToggle.Toggle.INDIVIDUAL);
  }

  static isFervieWelcomeEnabled() {
    return FeatureToggle.isFlowInsightApp() && FeatureToggle.isEnabled(FeatureToggle.Toggle.FERVIE_WELCOME);
  }

  static isMoovieApp() {
    return FeatureToggle.appType === FeatureToggle.AppType.WATCH_MOOVIES;
  }

  static isJournalApp() {
    return FeatureToggle.appType === FeatureToggle.AppType.FLOW_JOURNAL;
  }

  static isFlowInsightApp() {
    return FeatureToggle.appType === FeatureToggle.AppType.FLOW_INSIGHT;
  }

  static isFlowInsightOrJournalApp() {
    return FeatureToggle.appType === FeatureToggle.AppType.FLOW_INSIGHT
      || FeatureToggle.appType === FeatureToggle.AppType.FLOW_JOURNAL;
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
