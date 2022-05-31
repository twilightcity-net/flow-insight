import React from "react";

export default class FeatureToggle  {

  static isPairingEnabled = false;

  static isMoovieApp = true;

  static isFlowInsightApp() {
    return !FeatureToggle.isMoovieApp;
  }

}
