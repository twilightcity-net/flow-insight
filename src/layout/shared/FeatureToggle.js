import React from "react";

export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = false;

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

}
