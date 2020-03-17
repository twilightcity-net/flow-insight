import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this client is used to make service request to the main process's controller
 */
export class TalkToClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * our client event listeners that other classes use
   * @type {*}
   */
  static _listeners = [];

  /**
   * builds the Client for Gridtime TalkTo Client Service
   * @param scope
   */
  constructor(scope) {
    super(scope, "[TalkToClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_TO_CLIENT,
      this,
      null,
      this.onTalkToEventReply
    );
  }

  /**
   * our client events for this talk to service in gridtime
   * @returns {{LOAD_ALL_TALK_MESSAGES_FROM_ROOM: string, GET_ALL_TALK_MESSAGES_FROM_ROOM: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_ALL_TALK_MESSAGES_FROM_ROOM: "load-all-talk-messages-from-room",
      GET_ALL_TALK_MESSAGES_FROM_ROOM: "get-all-talk-messages-from-room"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TalkToClient.instance) {
      TalkToClient.instance = new TalkToClient(scope);
    }
  }

  /**
   * loads all talk messages from a given room from gridtime
   * @param roomName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadAllTalkMessagesFromRoom(roomName, scope, callback) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.LOAD_ALL_TALK_MESSAGES_FROM_ROOM,
      { roomName: roomName },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * gets all talk messages which have been loaded from gridtime into
   * our local database. if nothing exists we make a request to gridtime
   * to fetch these talk messages
   * @param roomName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getAllTalkMessagesFromRoom(roomName, scope, callback) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.GET_ALL_TALK_MESSAGES_FROM_ROOM,
      { roomName: roomName },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its receive the response from the main process. the
   * call back bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onTalkToEventReply = (event, arg) => {
    let clientEvent = TalkToClient.replies.get(arg.id);
    this.logReply(
      TalkToClient.name,
      TalkToClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      TalkToClient.replies.delete(arg.id);
    }
    clientEvent.callback(event, arg);
    this.notifyListeners(clientEvent);
  };

  /**
   * notifies the main process that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyTalkTo(clientEvent) {
    console.log(
      "[" + TalkToClient.name + "] notify -> " + JSON.stringify(clientEvent)
    );
    TalkToClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }

  /**
   * notifies any additional listeners that we have received some new data from the
   * talk to controller
   * @param clientEvent
   */
  notifyListeners(clientEvent) {
    console.log(
      "[" +
        TalkToClient.name +
        "] notify listeners {" +
        TalkToClient._listeners.length +
        "}-> " +
        JSON.stringify(clientEvent)
    );
    for (var i = TalkToClient._listeners.length - 1; i >= 0; i--) {
      let listener = TalkToClient._listeners[i];
      console.log(listener);

      // TODO this needs execute the callback of this listener
    }
  }

  /**
   * registers a new listener that is associated to a given client event. These listeners
   * wrapped as client events to maintain consistency.
   * @param clientEvent
   */
  registerListener(clientEvent) {
    console.log(
      "[" + TalkToClient.name + "] register -> " + JSON.stringify(clientEvent)
    );
    TalkToClient._listeners.push(clientEvent);
  }

  /**
   * removes the listener from our memory. this is important.
   * @param clientEvent
   */
  unregisterListener(clientEvent) {
    console.log(
      "[" +
        TalkToClient.name +
        "] unregister {" +
        TalkToClient._listeners.length +
        "} -> " +
        JSON.stringify(clientEvent)
    );
    for (var i = TalkToClient._listeners.length - 1; i >= 0; i--) {
      console.log(TalkToClient._listeners[i]);
      if (clientEvent === TalkToClient._listeners[i]) {
        TalkToClient._listeners.splice(i, 1);
      }
    }
  }
}
