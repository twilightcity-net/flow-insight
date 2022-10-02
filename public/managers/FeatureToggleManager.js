const HotkeyController = require("../controllers/HotkeyController");
const AppFeatureToggle = require("../app/AppFeatureToggle");
const FeatureToggleController = require("../controllers/FeatureToggleController");

/**
 * managing class for the feature toggle updates
 */
module.exports = class FeatureToggleManager {
  /**
   * builds the feature toggle manager for the global app scope
   */
  constructor() {
    this.name = "[FeatureToggleManager]";

    this.myController = new FeatureToggleController(this);
    this.myController.configureEvents();

    this.myController.init();
  }

  /**
   * Direct access from the backend process to toggle a feature
   * @param featureName
   */
  toggleFeature(featureName) {
    return this.myController.toggleFeature(featureName);
  }

  /**
   * Direct access from the backend process to find out if a feature is toggled on
   * @param featureName
   */
  isFeatureToggledOn(featureName) {
    return this.myController.isFeatureToggledOn(featureName);
  }

};
