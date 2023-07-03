import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import FeatureToggle from "../layout/shared/FeatureToggle";

/**
 * This is our class that gets and saves info related to feature toggles
 */
export class FeatureToggleClient extends BaseClient {
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
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!FeatureToggleClient.instance) {
      FeatureToggleClient.instance = new FeatureToggleClient(
        scope
      );
      FeatureToggleClient.initToggles();
    }
  }

  static initToggles() {
    FeatureToggleClient.getFeatureToggles(this, (arg) => {
      if (arg.data) {
        FeatureToggle.init(arg.data);
        FeatureToggleClient.instance.featureToggleScreenRefreshDispatch.dispatch({});
      }
    });
  }

  static refreshToggles() {
    FeatureToggleClient.getFeatureToggles(this, (arg) => {
      if (arg.data) {
        FeatureToggle.init(arg.data);
        FeatureToggleClient.instance.featureToggleScreenRefreshDispatch.dispatch({});
      }
    });
  }

  /**
   * gets all our current feature toggles
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getFeatureToggles(scope, callback) {
    let event =
      FeatureToggleClient.instance.createClientEvent(
        FeatureToggleClient.Events.GET_FEATURE_TOGGLES,
        {},
        scope,
        callback
      );
    FeatureToggleClient.instance.notifyFeatureToggle(event);
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
    let clientEvent = FeatureToggleClient.replies.get(
      arg.id
    );
    this.logReply(
      FeatureToggleClient.name,
      FeatureToggleClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      FeatureToggleClient.replies.delete(arg.id);
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
      FeatureToggleClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    FeatureToggleClient.replies.set(
      clientEvent.id,
      clientEvent
    );
    this.event.dispatch(clientEvent, true);
  }
}
