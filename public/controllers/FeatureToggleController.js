const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const AppFeatureToggle = require("../app/AppFeatureToggle");

/**
 * This class is used to manage requests for feature toggle state and updates
 * @type {FeatureToggleController}
 */
module.exports = class FeatureToggleController extends (
  BaseController
) {
  /**
   * builds our FeatureToggleController class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FeatureToggleController);
    if (!FeatureToggleController.instance) {
      FeatureToggleController.instance = this;
      FeatureToggleController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible notification events
   * @constructor
   */
  static get Events() {
    return {
      GET_FEATURE_TOGGLES: "get-feature-toggles",
    };
  }

  /**
   * Initialize feature toggle state
   */
  init() {
    this.featureToggles = global.App.AppSettings.getFeatureToggles();
    AppFeatureToggle.init(this.featureToggles);
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      FeatureToggleController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      FeatureToggleController.instance
    );
    this.featureToggleClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.FEATURE_TOGGLE_CLIENT,
        this,
        this.onFeatureToggleClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onFeatureToggleClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        FeatureToggleController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FeatureToggleController.Events.GET_FEATURE_TOGGLES:
          this.handleGetFeatureTogglesEvent(event, arg);
          break;
        default:
          throw new Error(
            FeatureToggleController.Error.UNKNOWN +
            " '" +
            arg.type +
            "'."
          );
      }
    }
  }


  /**
   * Toggle the feature on and off, update in app settings,
   * and send propagation event so the front end gets updated too
   * event updates
   * @param featureName
   */
  toggleFeature(featureName) {
    this.featureToggles = global.App.AppSettings.toggleFeature(featureName);
    AppFeatureToggle.init(this.featureToggles);
    //TODO propagate event to front end update too
  }

  /**
   * Test whether a feature is on or off, based on the feature toggle list
   * @param featureName
   * @returns {boolean}
   */
  isFeatureToggledOn(featureName) {
    for (let toggle of this.featureToggles) {
      if (toggle === featureName) {
        return true;
      }
    }
    return false;
  }


  /**
   * Gets all the configured feature toggles as a list
   * @param event
   * @param arg
   * @param callback
   */
  handleGetFeatureTogglesEvent(event, arg, callback) {

    arg.data = this.featureToggles;
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

}
