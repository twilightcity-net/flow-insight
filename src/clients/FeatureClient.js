import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 * This is our class that gets and saves info related to feature toggles
 */
export class FeatureClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for the Notifications in our local DB
   * @param scope
   */
  constructor(scope) {
    super(scope, "[FeatureToggleClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.FEATURE_TOGGLE_CLIENT,
      this,
      null,
      this.onFeatureToggleEventReply
    );
    this.featureToggleScreenRefreshDispatch =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .FEATURE_TOGGLE_SCREEN_REFRESH,
        this
      );
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
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!FeatureClient.instance) {
      FeatureClient.instance = new FeatureClient(
        scope
      );
      FeatureClient.initToggles();
    }
  }

  static initToggles() {
    FeatureClient.getFeatureToggles(this, (arg) => {
      if (arg.data) {
        FeatureToggle.init(arg.data);
      }
    });
  }

  static refreshToggles() {
    FeatureClient.getFeatureToggles(this, (arg) => {
      if (arg.data) {
        FeatureToggle.init(arg.data);
        FeatureClient.instance.featureToggleScreenRefreshDispatch.dispatch({});
      }
    });
  }

  static refreshTogglesSilently() {
    FeatureClient.getFeatureToggles(this, (arg) => {
      if (arg.data) {
        FeatureToggle.init(arg.data);
      }
    });
  }

  /**
   * Set the configured active metric set
   * @param metricSet
   * @param scope
   * @param callback
   */
  static setActiveMetricSet(metricSet, scope, callback) {
    let event =
      FeatureClient.instance.createClientEvent(
        FeatureClient.Events.SET_ACTIVE_METRIC_SET,
        {metricSet: metricSet},
        scope,
        callback
      );
    FeatureClient.instance.notifyFeatureToggle(event);
  }


  /**
   * Get the configured active metric set (if any - optional)
   * @param scope
   * @param callback
   */
  static getActiveMetricSet(scope, callback) {
    let event =
      FeatureClient.instance.createClientEvent(
        FeatureClient.Events.GET_ACTIVE_METRIC_SET,
        {},
        scope,
        callback
      );
    FeatureClient.instance.notifyFeatureToggle(event);
  }


  /**
   * Toggle ON the specified feature and broadcast update
   * @param feature
   * @param scope
   * @param callback
   */
  static toggleOnFeature(feature, scope, callback) {
    let event =
      FeatureClient.instance.createClientEvent(
        FeatureClient.Events.TOGGLE_ON_FEATURE,
        {feature: feature},
        scope,
        callback
      );
    FeatureClient.instance.notifyFeatureToggle(event);
  }

  /**
   * Toggle OFF the specified feature and broadcast update
   * @param feature
   * @param scope
   * @param callback
   */
  static toggleOffFeature(feature, scope, callback) {
    let event =
      FeatureClient.instance.createClientEvent(
        FeatureClient.Events.TOGGLE_OFF_FEATURE,
        {feature: feature},
        scope,
        callback
      );
    FeatureClient.instance.notifyFeatureToggle(event);
  }

  /**
   * gets all our current feature toggles
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getFeatureToggles(scope, callback) {
    let event =
      FeatureClient.instance.createClientEvent(
        FeatureClient.Events.GET_FEATURE_TOGGLES,
        {},
        scope,
        callback
      );
    FeatureClient.instance.notifyFeatureToggle(event);
    return event;
  }


  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onFeatureToggleEventReply = (event, arg) => {
    let clientEvent = FeatureClient.replies.get(
      arg.id
    );
    this.logReply(
      FeatureClient.name,
      FeatureClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      FeatureClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyFeatureToggle(clientEvent) {
    console.log(
      "[" +
      FeatureClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    FeatureClient.replies.set(
      clientEvent.id,
      clientEvent
    );
    this.event.dispatch(clientEvent, true);
  }
}
