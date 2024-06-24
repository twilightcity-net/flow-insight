import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to converse with the local backend about configured fervie action extensions
 */
export class FervieActionClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for fervie action requests
   * @param scope
   */
  constructor(scope) {
    super(scope, "[FervieActionClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.FERVIE_ACTION_CLIENT,
      this,
      null,
      this.onFervieActionEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @constructor
   */
  static get Events() {
    return {
      GET_ALL_FERVIE_ACTIONS: "get-all-fervie-actions",
      RUN_FERVIE_ACTION: "run-fervie-action",
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!FervieActionClient.instance) {
      FervieActionClient.instance = new FervieActionClient(scope);
    }
  }

  /**
   * Retrieve all fervie action extensions across all plugins
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getAllFervieActions(
    scope,
    callback
  ) {
    let event = FervieActionClient.instance.createClientEvent(
      FervieActionClient.Events.GET_ALL_FERVIE_ACTIONS,
      {},
      scope,
      callback
    );

    FervieActionClient.instance.notifyFervieAction(event);
    return event;
  }


  /**
   * Trigger an action callback within the IDE for the provided actionId
   * @param actionId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static runFervieAction(actionId,
    scope,
    callback
  ) {
    let event = FervieActionClient.instance.createClientEvent(
      FervieActionClient.Events.RUN_FERVIE_ACTION,
      {actionId: actionId},
      scope,
      callback
    );

    FervieActionClient.instance.notifyFervieAction(event);
    return event;
  }



  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onFervieActionEventReply = (event, arg) => {
    let clientEvent = FervieActionClient.replies.get(arg.id);
    this.logReply(
      FervieActionClient.name,
      FervieActionClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      FervieActionClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process code that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyFervieAction(clientEvent) {
    console.log(
      "[" +
        FervieActionClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    FervieActionClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
