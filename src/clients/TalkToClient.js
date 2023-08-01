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
      PUBLISH_CHAT_TO_DM: "publish-chat-to-dm",
      REACT_TO_MESSAGE: "react-to-message",
      REACT_TO_DIRECT_MESSAGE: "react-to-direct-message",
      CLEAR_REACTION_TO_MESSAGE: "clear-reaction-to-message",
      CLEAR_REACTION_TO_DIRECT_MESSAGE: "clear-reaction-to-direct-message",
      PUBLISH_PUPPET_CHAT_TO_ROOM: "publish-puppet-chat-to-room",
      PUBLISH_STATUS_CHAT_TO_ROOM: "publish-status-chat-to-room",
      JOIN_EXISTING_ROOM: "join-existing-room",
      LEAVE_EXISTING_ROOM: "leave-existing-room",
      GET_DMS_WITH_MEMBER: "get-dms-with-member",
      GET_DM_REACTIONS_WITH_MEMBER: "get-dm-reactions-with-member",
      CLEAR_CHAT: "clear-chat",
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
   * Clear the dm chat messages for a specific memberId
   * @param memberId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static clearChat(
    memberId,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.CLEAR_CHAT,
      { memberId: memberId },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * publishes a chat message as a direct message
   * @param memberId
   * @param text
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static publishChatToDM(
    memberId,
    text,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.PUBLISH_CHAT_TO_DM,
      { memberId: memberId, text: text },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }


  /**
   * Gets all available DMs from a specific member.
   * Will include any offline notifications, and recent direct messages
   * while the app has been online
   * @param memberId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getDMsWithMember(
    memberId,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.GET_DMS_WITH_MEMBER,
      { memberId: memberId},
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }


  /**
   * Gets all available DM reactions for a specific member conversation.
   * Will include any known reactions to offline or online messages
   * @param memberId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getDMReactionsWithMember(
    memberId,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.GET_DM_REACTIONS_WITH_MEMBER,
      { memberId: memberId},
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * Reacts to a specific message with an emoji.
   * If the user has already reacted with an emoji, adding a new emoji will replace the old one
   * @param roomName
   * @param messageId
   * @param emoji
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static reactToMessage(
    roomName,
    messageId,
    emoji,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.REACT_TO_MESSAGE,
      { roomName: roomName, messageId: messageId, emoji: emoji },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }



  /**
   * Reacts to a specific direct message with an emoji.
   * If the user has already reacted with an emoji, adding a new emoji will replace the old one
   * @param memberId
   * @param messageId
   * @param emoji
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static reactToDirectMessage(
    memberId,
    messageId,
    emoji,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.REACT_TO_DIRECT_MESSAGE,
      { memberId: memberId, messageId: messageId, emoji: emoji },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }

  /**
   * Clears an existing reaction to a message, such as when the user clicks the reaction
   * to turn it off.
   * @param roomName
   * @param messageId
   * @param emoji
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static clearReactionToMessage(
    roomName,
    messageId,
    emoji,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.CLEAR_REACTION_TO_MESSAGE,
      { roomName: roomName, emoji: emoji, messageId: messageId },
      scope,
      callback
    );
    TalkToClient.instance.notifyTalkTo(event);
    return event;
  }



  /**
   * Clears an existing reaction to a message, such as when the user clicks the reaction
   * to turn it off.
   * @param memberId
   * @param messageId
   * @param emoji
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static clearReactionToDirectMessage(
    memberId,
    messageId,
    emoji,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.CLEAR_REACTION_TO_DIRECT_MESSAGE,
      { memberId: memberId, emoji: emoji, messageId: messageId },
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
   * publishes a status chat message to a room, fully resolved into
   * a single message string
   * @param roomName
   * @param text
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static publishStatusChatToRoom(
    roomName,
    text,
    scope,
    callback
  ) {
    let event = TalkToClient.instance.createClientEvent(
      TalkToClient.Events.PUBLISH_STATUS_CHAT_TO_ROOM,
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
