const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const AppFeatureToggle = require("../app/AppFeatureToggle");

/**
 * This class is used to manage requests for feature toggle state and updates
 * @type {FeatureController}
 */
module.exports = class FeatureController extends (
  BaseController
) {
  /**
   * builds our FeatureController class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FeatureController);
    if (!FeatureController.instance) {
      FeatureController.instance = this;
      FeatureController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible notification events
   * @constructor
   */
  static get Events() {
    return {
      GET_FEATURE_TOGGLES: "get-feature-toggles",
      TOGGLE_ON_FEATURE: "toggle-on-feature",
      TOGGLE_OFF_FEATURE: "toggle-off-feature",
      GET_ACTIVE_METRIC_SET: "get-active-metric-set",
      SET_ACTIVE_METRIC_SET: "set-active-metric-set",
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
      FeatureController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      FeatureController.instance
    );
    this.featureToggleClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.FEATURE_TOGGLE_CLIENT,
        this,
        this.onFeatureToggleClientEvent,
        null
      );

    this.toggleRefreshNotifier =
      EventFactory.createEvent(
        EventFactory.Types.FEATURE_TOGGLE_DATA_REFRESH,
        this
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
        FeatureController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FeatureController.Events.GET_FEATURE_TOGGLES:
          this.handleGetFeatureTogglesEvent(event, arg);
          break;
        case FeatureController.Events.TOGGLE_ON_FEATURE:
          this.handleToggleOnFeatureEvent(event, arg);
          break;
        case FeatureController.Events.TOGGLE_OFF_FEATURE:
          this.handleToggleOffFeatureEvent(event, arg);
          break;
        case FeatureController.Events.GET_ACTIVE_METRIC_SET:
          this.handleGetActiveMetricSetEvent(event, arg);
          break;
        case FeatureController.Events.SET_ACTIVE_METRIC_SET:
          this.handleSetActiveMetricSetEvent(event, arg);
          break;
        default:
          throw new Error(
            FeatureController.Error.UNKNOWN +
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

    this.toggleRefreshNotifier.dispatch({});
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
   * Get the active configured metric set (if any - optional)
   * @param event
   * @param arg
   * @param callback
   */
  handleGetActiveMetricSetEvent(event, arg, callback) {
    const metricSet = global.App.AppSettings.getActiveMetricSet();
    arg.data =  arg.data = {metricSet: metricSet};
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Sets the active configured metric set
   * @param event
   * @param arg
   * @param callback
   */
  handleSetActiveMetricSetEvent(event, arg, callback) {
    const metricSet = arg.args.metricSet;

    global.App.AppSettings.setActiveMetricSet(metricSet);

    arg.data = {metricSet: metricSet};
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
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


  /**
   * Toggles a feature on, and writes the updated configuration to file
   * @param event
   * @param arg
   * @param callback
   */
  handleToggleOnFeatureEvent(event, arg, callback) {
    const featureName = arg.args.feature;

    this.featureToggles = global.App.AppSettings.toggleOnFeature(featureName);
    AppFeatureToggle.init(this.featureToggles);

    arg.data = this.featureToggles;

    this.toggleRefreshNotifier.dispatch({});
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Toggles a feature on, and writes the updated configuration to file
   * @param event
   * @param arg
   * @param callback
   */
  handleToggleOffFeatureEvent(event, arg, callback) {
    const featureName = arg.args.feature;

    this.featureToggles = global.App.AppSettings.toggleOffFeature(featureName);
    AppFeatureToggle.init(this.featureToggles);

    arg.data = this.featureToggles;

    this.toggleRefreshNotifier.dispatch({});
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

}
