import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to retrieve current flow state date
 */
export class FlowClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for code module requests in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[CodeClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.FLOW_CLIENT,
      this,
      null,
      this.onFlowEventReply
    );
  }

  /**
   * general enum list of all of our possible events
   * @constructor
   */
  static get Events() {
    return {
      GET_MY_FLOW: "get-my-flow"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!FlowClient.instance) {
      FlowClient.instance = new FlowClient(scope);
    }
  }

  /**
   * Retrieves my current realtime flow data from the local DB
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMyFlowData(scope, callback) {
    let event = FlowClient.instance.createClientEvent(
      FlowClient.Events.GET_MY_FLOW,
      {},
      scope,
      callback
    );
    FlowClient.instance.notifyFlow(event);
    return event;
  }



  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onFlowEventReply = (event, arg) => {
    let clientEvent = FlowClient.replies.get(arg.id);
    this.logReply(
      FlowClient.name,
      FlowClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      FlowClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process code that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyFlow(clientEvent) {
    console.log(
      "[" +
      FlowClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    FlowClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
