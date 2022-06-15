const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  Util = require("../Util");

/**
 * This class is used to coordinate controllers across the talknet service
 * @type {TalkToController}
 */
module.exports = class TalkToController extends (
  BaseController
) {
  /**
   * builds our static Circuit controller which interfaces mainly with our local database
   * @param scope
   */
  constructor(scope) {
    super(scope, TalkToController);
    if (!TalkToController.instance) {
      TalkToController.instance = this;
      TalkToController.wireControllersTogether();
    }
  }

  /**
   * general enum list of all of our possible circuit events
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
      JOIN_EXISTING_ROOM: "join-existing-room",
      LEAVE_EXISTING_ROOM: "leave-existing-room",
      GET_DMS_WITH_MEMBER: "get-dms-with-member",
      GET_DM_REACTIONS_WITH_MEMBER: "get-dm-reactions-with-member",
      CLEAR_CHAT: "clear-chat",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(
      TalkToController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TalkToController.instance);
    this.talkToClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.TALK_TO_CLIENT,
        this,
        this.onTalkToClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTalkToClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        TalkToController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case TalkToController.Events
          .GET_ALL_TALK_MESSAGES_FROM_ROOM:
          this.handleGetAllTalkMessagesFromRoomEvent(
            event,
            arg
          );
          break;
        case TalkToController.Events.PUBLISH_CHAT_TO_ROOM:
          this.handlePublishChatToRoomEvent(event, arg);
          break;
        case TalkToController.Events.PUBLISH_CHAT_TO_DM:
          this.handlePublishChatToDMEvent(event, arg);
          break;
        case TalkToController.Events.GET_DMS_WITH_MEMBER:
          this.handleGetDMsWithMemberEvent(event, arg);
          break;
        case TalkToController.Events.GET_DM_REACTIONS_WITH_MEMBER:
          this.handleGetDMReactionsWithMemberEvent(event, arg);
          break;
        case TalkToController.Events.CLEAR_CHAT:
          this.handleClearChatEvent(event, arg);
          break;
        case TalkToController.Events.REACT_TO_MESSAGE:
          this.handleReactToMessageEvent(event, arg);
          break;
        case TalkToController.Events.REACT_TO_DIRECT_MESSAGE:
          this.handleReactToDirectMessageEvent(event, arg);
          break;
        case TalkToController.Events.CLEAR_REACTION_TO_MESSAGE:
          this.handleClearReactionToMessageEvent(event, arg);
          break;
        case TalkToController.Events.CLEAR_REACTION_TO_DIRECT_MESSAGE:
          this.handleClearReactionToDirectMessageEvent(event, arg);
          break;
        case TalkToController.Events.PUBLISH_PUPPET_CHAT_TO_ROOM:
          this.handlePublishPuppetChatToRoomEvent(event, arg);
          break;
        case TalkToController.Events.JOIN_EXISTING_ROOM:
          this.handleJoinExistingRoomEvent(event, arg);
          break;
        case TalkToController.Events.LEAVE_EXISTING_ROOM:
          this.handleLeaveExistingRoomEvent(event, arg);
          break;
        default:
          throw new Error(
            TalkToController.Error.UNKNOWN_TALK_TO_EVENT +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * helped function which is used to load all room messages into the db collection
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllTalkNessagesFromRoomEvent(
    event,
    arg,
    callback
  ) {
    let roomName = arg.args.roomName,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      {},
      TalkToController.Names
        .GET_ALL_TALK_MESSAGES_FROM_ROOM,
      TalkToController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadAllTalkMessagesFromRoomCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback processor for our load all talk messages from a specific room
   * action. We need to find and update any existing ones. I dont think we need to
   * batch room these, however we should have some type of process that can
   * room duplicates, if any exist.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllTalkMessagesFromRoomCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let messages = store.data;
      if (messages) {
        let uri = Util.getUriFromMessageArray(messages),
          roomName =
            Util.getRoomNameFromMessageArray(messages),
          database = DatabaseFactory.getDatabase(
            DatabaseFactory.Names.TALK
          ),
          messageCollection =
            database.getCollectionForRoomTalkMessages(uri),
          statusCollection =
            database.getCollectionForRoomStatusTalkMessages(
              uri
            ),
          messageView =
            database.getViewTalkMessagesForCollection(
              messageCollection
            ),
          statusView =
            database.getViewStatusTalkMessagesForCollection(
              statusCollection
            );

        database.findRoomAndInsert(roomName, uri);
        for (
          let i = 0, message = null, len = messages.length;
          i < len;
          i++
        ) {
          message = messages[i];
          if (
            message.messageType ===
            (TalkToController.MessageTypes.CIRCUIT_STATUS ||
              TalkToController.MessageTypes
                .ROOM_MEMBER_STATUS_EVENT)
          ) {
            database.insertRoomStatusMessage(
              message,
              statusCollection
            );
          } else if (
            TalkToController.MessageTypes
              .CHAT_MESSAGE_DETAILS
          ) {
            database.insertRoomChatMessage(
              message,
              messageCollection
            );
          } else {
            console.warn(
              TalkToController.Error
                .UNKNOWN_TALK_MESSAGE_TYPE +
                " '" +
                message.messageType +
                "'."
            );
          }
        }
        this.logResults(
          this.name,
          arg.type,
          arg.id,
          messageView.count() + "+" + statusView.count()
        );
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets our talk messages from a given room name
   * @param event
   * @param arg
   * @param callback
   */

  handleGetAllTalkMessagesFromRoomEvent(
    event,
    arg,
    callback
  ) {
    let roomName = arg.args.roomName,
      uri = arg.args.uri,
      database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TALK
      ),
      collection =
        database.getCollectionForRoomTalkMessages(uri),
      view =
        database.getViewTalkMessagesForCollection(
          collection
        );

    this.delegateGetFromViewOrLoadCallback(
      roomName,
      uri,
      view,
      event,
      arg,
      callback
    );
  }

  /**
   * processes our talk status message requests from our server on gridtime.
   * we assume that we have already loaded some messages with a load call first.
   * @param roomName
   * @param uri
   * @param view
   * @param event
   * @param arg
   * @param callback
   */
  delegateGetFromViewOrLoadCallback(
    roomName,
    uri,
    view,
    event,
    arg,
    callback
  ) {
    //these cached messages will be stale as soon as we leave the room,
    // since we only hear messages for rooms we are joined
    // if (this.hasRoomByRoomName(roomName)) {
    //   arg.data = view.data();
    //   this.logResults(
    //     this.name,
    //     arg.type,
    //     arg.id,
    //     view.count()
    //   );
    //   this.delegateCallbackOrEventReplyTo(
    //     event,
    //     arg,
    //     callback
    //   );
    // } else {
    this.handleLoadAllTalkNessagesFromRoomEvent(
      null,
      {
        args: { roomName: roomName, uri: uri },
        type: arg.type,
        id: arg.id,
      },
      () => {
        arg.data = view.data();
        this.delegateCallbackOrEventReplyTo(
          event,
          arg,
          callback
        );
      }
    );
  }


  /**
   * Publish a puppet type message to the talk room,
   * which works exactly the same as normal chat, except sends a different object type
   * requires a puppet claim in the room
   * @param event
   * @param arg
   * @param callback
   */
  handlePublishPuppetChatToRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      text = arg.args.text,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.PUPPET;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { chatMessage: text },
      TalkToController.Names.PUBLISH_PUPPET_CHAT_TO_ROOM,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }



  /**
   * process our publish to chat room service event. This is called by an action
   * from the gui client. This controller posts this request to gridtime,
   * which will update the database. Grid time will subsequentially make a REST
   * call to talknet server to broadcast this text message. Talk then will route
   * the message to all connected cliented to that specific room that is
   * stored as a guid.
   * @param event
   * @param arg
   * @param callback
   */
  handlePublishChatToRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      text = arg.args.text,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.CHAT;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { chatMessage: text },
      TalkToController.Names.PUBLISH_CHAT_TO_ROOM,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * process our publish to chat dm (direct message) service event.
   * This posts the chat to gridtime which is sent directly to the client over talk
   * @param event
   * @param arg
   * @param callback
   */
  handlePublishChatToDMEvent(event, arg, callback) {
    let memberId = arg.args.memberId,
      text = arg.args.text,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.MEMBER +
        TalkToController.Paths.SEPARATOR +
        memberId +
        TalkToController.Paths.CHAT;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { chatMessage: text },
      TalkToController.Names.PUBLISH_CHAT_TO_DM,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.saveDMMessage(
          store,
          event,
          arg,
          callback
        )
    );
  }

  static fromUserNameMetaPropsStr = "from.username";
  static fromMemberIdMetaPropsStr = "from.member.id";

  /**
   * Save the DM message to the local DB, then do the normal callback
   */
  saveDMMessage(store, event, arg, callback) {

    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;

      let dmDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.DM
      );

      let id = arg.data.id,
        messageTime = arg.data.messageTime,
        metaProps = arg.data.metaProps;

      let fromMemberId = metaProps[TalkToController.fromMemberIdMetaPropsStr];
      let fromUsername = metaProps[TalkToController.fromUserNameMetaPropsStr];

      dmDatabase.addMessage({
        id: id,
        timestamp: messageTime,
        createdDate: Util.getTimeString(messageTime),
        withMemberId: arg.args.memberId,
        fromMemberId: fromMemberId,
        fromUsername: fromUsername,
        message: arg.args.text,
        isOffline: false,
        read: true
      });
    }

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      JSON.stringify({memberId: arg.args.memberId}) //dont log the chat messages
    );

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }



  /**
   * Save the DM reaction to the local DB, then do the normal callback
   */
  saveDMReactionMessage(store, event, arg, callback) {

    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;

      let dmDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.DM
      );

      let id = arg.data.id,
        messageTime = arg.data.messageTime,
        metaProps = arg.data.metaProps,
        reaction = arg.data.data;

      let fromMemberId = metaProps[TalkToController.fromMemberIdMetaPropsStr];
      let fromUsername = metaProps[TalkToController.fromUserNameMetaPropsStr];

      dmDatabase.addReaction({
        id: id,
        timestamp: messageTime,
        createdDate: Util.getTimeString(messageTime),
        withMemberId: arg.args.memberId,
        fromMemberId: fromMemberId,
        fromUsername: fromUsername,
        emoji: reaction.emoji,
        messageId: reaction.messageId,
        chatReactionChangeType: reaction.chatReactionChangeType,
        isOffline: false,
        read: true
      });
    }

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      JSON.stringify({memberId: arg.args.memberId}) //dont log the chat messages
    );

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }



  /**
   * Retrieves the existing DM reactions for a member conversation from the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleGetDMReactionsWithMemberEvent(event, arg, callback) {
    let memberId = arg.args.memberId;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.DM
    );

    arg.data = database.findReactionsWithMember(memberId);

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      JSON.stringify(arg.args)
    );

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * Retrieves the existing DMs from a member from the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleGetDMsWithMemberEvent(event, arg, callback) {
    let memberId = arg.args.memberId;

    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.DM
      );

    arg.data = database.findDMsWithMember(memberId);

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      JSON.stringify(arg.args)
    );

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * Handles clearing the local chat cache
   * @param event
   * @param arg
   * @param callback
   */
  handleClearChatEvent(event, arg, callback) {
    let memberId = arg.args.memberId;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.DM
    );

    database.clearChat(memberId);

    let urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.MEMBER +
        TalkToController.Paths.SEPARATOR +
         memberId +
        TalkToController.Paths.CLEAR;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      {},
      TalkToController.Names.CLEAR_CHAT,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * Handles adding an emoji reaction to a message
   * @param event
   * @param arg
   * @param callback
   */
  handleReactToMessageEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      messageId = arg.args.messageId,
      emoji = arg.args.emoji,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.MESSAGE +
        TalkToController.Paths.SEPARATOR +
        messageId;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { emoji: emoji, chatReactionChangeType: "ADD" },
      TalkToController.Names.REACT_TO_MESSAGE,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * Handles adding an emoji reaction to a direct message
   * @param event
   * @param arg
   * @param callback
   */
  handleReactToDirectMessageEvent(event, arg, callback) {
    let memberId = arg.args.memberId,
      messageId = arg.args.messageId,
      emoji = arg.args.emoji,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.MEMBER +
        TalkToController.Paths.SEPARATOR +
        memberId +
        TalkToController.Paths.MESSAGE +
        TalkToController.Paths.SEPARATOR +
        messageId;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { emoji: emoji, chatReactionChangeType: "ADD" },
      TalkToController.Names.REACT_TO_MESSAGE,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.saveDMReactionMessage(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * Handles clearing an existing emoji reaction on a message
   * @param event
   * @param arg
   * @param callback
   */
  handleClearReactionToMessageEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      messageId = arg.args.messageId,
      emoji = arg.args.emoji,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.MESSAGE +
        TalkToController.Paths.SEPARATOR +
        messageId;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { emoji: emoji, chatReactionChangeType: "REMOVE" },
      TalkToController.Names.REACT_TO_MESSAGE,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }



  /**
   * Handles clearing an existing emoji reaction on a direct message
   * @param event
   * @param arg
   * @param callback
   */
  handleClearReactionToDirectMessageEvent(event, arg, callback) {
    let memberId = arg.args.memberId,
      messageId = arg.args.messageId,
      emoji = arg.args.emoji,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.MEMBER +
        TalkToController.Paths.SEPARATOR +
        memberId +
        TalkToController.Paths.MESSAGE +
        TalkToController.Paths.SEPARATOR +
        messageId;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      { emoji: emoji, chatReactionChangeType: "REMOVE" },
      TalkToController.Names.REACT_TO_MESSAGE,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * joins a talk room from a given room name. This is set within the
   * arg.args object that is passed  in from our client. This function
   * will make a dtp http request to gridtime for joining a room. Talk
   * will not complain if you join a room that you already are in. if
   * room doesn't exist in talk, the server will create a new one. Also
   * the  room will remain open until everyone is kicked (left) from
   * the room
   * @param event
   * @param arg
   * @param callback
   */
  handleJoinExistingRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.JOIN;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      {},
      TalkToController.Names.JOIN_EXISTING_ROOM,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * processes our client event for leaving a room on talk. To do this
   * we make a request with gridtime to join when connecting to this
   * from the renderer's circuit resource class. This calls calls the
   * talkto client which joins the  room. This renderer class also will
   * call leave on the talkto client. See gridtimes TalkToClient.java
   * class for more information.
   * @param event
   * @param arg - our argument. requires .args.roomName
   * @param callback
   */
  handleLeaveExistingRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      urn =
        TalkToController.Paths.TALK +
        TalkToController.Paths.TO +
        TalkToController.Paths.ROOM +
        TalkToController.Paths.SEPARATOR +
        roomName +
        TalkToController.Paths.LEAVE;

    this.doClientRequest(
      TalkToController.Contexts.TALK_TO_CLIENT,
      {},
      TalkToController.Names.LEAVE_EXISTING_ROOM,
      TalkToController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  defaultDelegateCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      //details will be pushed to team member DB, so we dont need to save separately
      arg.data = store.data;
    }

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      JSON.stringify(arg.args)
    );

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }



};
