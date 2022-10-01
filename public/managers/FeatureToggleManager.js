const HotkeyController = require("../controllers/HotkeyController");
const AppFeatureToggle = require("../app/AppFeatureToggle");

/**
 * managing class for the feature toggle updates
 */
module.exports = class FeatureToggleManager {
  /**
   * builds the feature toggle manager for the global app scope
   */
  constructor() {
    this.name = "[FeatureToggleManager]";
    //we will need to be able to propagate events to tell the front end to update as well
    // maybe we make an api that allows us to get the toggles
    //then we can define the events...

    //Each window will need to get the settings...?  Or just the console really.

    // this.myController = new HotkeyController(this);
    // this.myController.configureEvents();

    this.featureToggles = global.App.AppSettings.getFeatureToggles();
    AppFeatureToggle.init(this.featureToggles);
  }

  toggleFeature(featureName) {
    this.featureToggles = global.App.AppSettings.toggleFeature(featureName);
    AppFeatureToggle.init(this.featureToggles);
    //TODO propagate event to front end update too
  }

  isFeatureToggledOn(featureName) {
    for (let toggle of this.featureToggles) {
      if (toggle === featureName) {
        return true;
      }
    }
    return false;
  }

};
