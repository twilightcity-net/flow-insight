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
   * @constructor
   */
  static get Events() {
    return {
      GET_ALL_TALK_MESSAGES_FROM_ROOM:
        "get-all-talk-messages-from-room",
      PUBLISH_CHAT_TO_ROOM: "publish-chat-to-room",
      PUBLISH_PUPPET_CHAT_TO_ROOM: "publish-puppet-chat-to-room",
      JOIN_EXISTING_ROOM: "join-existing-room",
      LEAVE_EXISTING_ROOM: "leave-existing-room",
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
   * gets all talk messages which have been loaded from gridtime into
   * our local database. if nothing exists we make a request to gridtime
   * to fetch these talk messages
   * @param roomName
   * @param uri
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getAllTalkMessagesFromRoom(
    roomName,
    uri,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.GET_ALL_TALK_MESSAGES_FROM_ROOM,
      { roomName: roomName, uri: uri },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * publishes a chat message to a room
   * @param roomName
   * @param text
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static publishChatToRoom(
    roomName,
    text,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.PUBLISH_CHAT_TO_ROOM,
      { roomName: roomName, text: text },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * publishes a puppet chat message to a room
   * @param roomName
   * @param text
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static publishPuppetChatToRoom(
    roomName,
    text,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.PUBLISH_PUPPET_CHAT_TO_ROOM,
      { roomName: roomName, text: text },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * joins a  specific room by its name. This call is picked up by the
   * controller class within the main process via our IPC event bus
   * @param roomName
   * @param scope
   * @param callback
   */
  static joinExistingRoom(roomName, scope, callback) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.JOIN_EXISTING_ROOM,
      { roomName: roomName },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * leaves an existing room on our talknet server. This is called by our
   * circuit resource class. We should leave the rooms on talk  so that
   * we do not get extra messages when we are not active in a circuit.
   * When a room has no one left, talk will automagically  remove the
   * room. Talk does not store a history of record for it rooms. Some
   * assembly required. See gridtime's documentation on building rooms.
   * @param roomName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static leaveExistingRoom(roomName, scope, callback) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.LEAVE_EXISTING_ROOM,
      { roomName: roomName },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**~
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
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyTalkTo(clientEvent) {
    console.log(
      "[" +
        TalkToClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    TalkToClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
