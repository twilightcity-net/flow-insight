const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  TalkDatabase = require("../database/TalkDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {TalkToController}
 */
module.exports = class TalkToController extends BaseController {
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
   * @returns {{LOAD_ALL_TALK_MESSAGES_FROM_ROOM: string, GET_ALL_STATUS_TALK_MESSAGES_FROM_ROOM: string, GET_ALL_TALK_MESSAGES_FROM_ROOM: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_ALL_TALK_MESSAGES_FROM_ROOM: "load-all-talk-messages-from-room",
      GET_ALL_TALK_MESSAGES_FROM_ROOM: "get-all-talk-messages-from-room",
      GET_ALL_STATUS_TALK_MESSAGES_FROM_ROOM:
        "get-all-status-talk-messages-from-room",
      PUBLISH_CHAT_TO_ROOM: "publish-chat-to-room"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(TalkToController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TalkToController.instance);
    this.talkToClientEventListener = EventFactory.createEvent(
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
      this.handleError(TalkToController.Error.ERROR_ARGS, event, arg);
    } else {
      switch (arg.type) {
        case TalkToController.Events.LOAD_ALL_TALK_MESSAGES_FROM_ROOM:
          this.handleLoadAllTalkNessagesFromRoomEvent(event, arg);
          break;
        case TalkToController.Events.GET_ALL_TALK_MESSAGES_FROM_ROOM:
          this.handleGetAllTalkMessagesFromRoomEvent(event, arg);
          break;
        case TalkToController.Events.GET_ALL_STATUS_TALK_MESSAGES_FROM_ROOM:
          this.handleGetAllStatusTalkMessagesFromRoomEvent(event, arg);
          break;
        case TalkToController.Events.PUBLISH_CHAT_TO_ROOM:
          this.handlePublishChatToRoomEvent(event, arg);
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
  handleLoadAllTalkNessagesFromRoomEvent(event, arg, callback) {
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
      TalkToController.Names.GET_ALL_TALK_MESSAGES_FROM_ROOM,
      TalkToController.Types.GET,
      urn,
      store =>
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
  delegateLoadAllTalkMessagesFromRoomCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let roomName = arg.args.roomName,
        database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
        messageCollection = database.getCollectionForRoomTalkMessages(roomName),
        statusCollection = database.getCollectionForRoomStatusTalkMessages(
          roomName
        ),
        messageView = database.getViewTalkMessagesForCollection(
          messageCollection
        ),
        statusView = database.getViewStatusTalkMessagesForCollection(
          statusCollection
        ),
        messages = store.data,
        message = messages[0],
        type = null,
        uri = message.uri;

      if (messages && message) {
        this.checkForRoomAndToRooms(roomName, uri);
        for (let i = 0, model = null, len = messages.length; i < len; i++) {
          message = messages[i];
          type = message.messageType;
          switch (type) {
            case TalkToController.MessageTypes.CIRCUIT_STATUS:
              this.findAndUpdateMessage(model, statusCollection, message);
              break;
            case TalkToController.MessageTypes.ROOM_MEMBER_STATUS:
              this.findAndUpdateMessage(model, statusCollection, message);
              break;
            default:
              this.findAndUpdateMessage(model, messageCollection, message);
          }
        }
      }
      this.logResults(
        this.name,
        arg.type,
        arg.id,
        messageView.count() + "+" + statusView.count()
      );
    }
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  /**
   * gets our talk messages from a given room name
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllTalkMessagesFromRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
      collection = database.getCollectionForRoomTalkMessages(roomName),
      view = database.getViewTalkMessagesForCollection(collection);

    this.delegateGetAllStatusTalkMessagesFromRoomCallback(
      roomName,
      view,
      event,
      arg,
      callback
    );
  }

  handleGetAllStatusTalkMessagesFromRoomEvent(event, arg, callback) {
    let roomName = arg.args.roomName,
      database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
      collection = database.getCollectionForRoomStatusTalkMessages(roomName),
      view = database.getViewStatusTalkMessagesForCollection(collection);

    this.delegateGetAllStatusTalkMessagesFromRoomCallback(
      roomName,
      view,
      event,
      arg,
      callback
    );
  }

  delegateGetAllStatusTalkMessagesFromRoomCallback(
    roomName,
    view,
    event,
    arg,
    callback
  ) {
    if (this.hasRoomByRoomName(roomName)) {
      arg.data = view.data();
      this.logResults(this.name, arg.type, arg.id, view.count());
      this.delegateCallbackOrEventReplyTo(event, arg, callback);
    } else {
      this.handleLoadAllTalkNessagesFromRoomEvent(
        null,
        { args: { roomName: roomName }, type: arg.type, id: arg.id },
        () => {
          arg.data = view.data();
          this.delegateCallbackOrEventReplyTo(event, arg, callback);
        }
      );
    }
  }

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
      store =>
        this.delegatePublishChatToRoomCallback(store, event, arg, callback)
    );
  }

  delegatePublishChatToRoomCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let roomName = arg.args.roomName,
        database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
        messageCollection = database.getCollectionForRoomTalkMessages(roomName),
        messageView = database.getViewTalkMessagesForCollection(
          messageCollection
        ),
        message = store.data,
        uri = message.uri;

      if (message) {
        this.checkForRoomAndToRooms(roomName, uri);
        messageCollection.insert(message);
        arg.data = message;
      }
      this.logResults(this.name, arg.type, arg.id, messageView.count());
    }
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  /**
   * adds a room to our rooms collection for reference
   * @param roomName
   * @param uri
   */
  checkForRoomAndToRooms(roomName, uri) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
      rooms = database.getCollection(TalkDatabase.Collections.ROOMS),
      room = rooms.findOne({ uri: uri });

    if (!room) {
      rooms.insert({ roomName, uri });
    }
  }

  /**
   * checks our database to see if we have a room for the night
   * @param roomName
   * @returns {Object}
   */
  hasRoomByRoomName(roomName) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK),
      rooms = database.getCollection(TalkDatabase.Collections.ROOMS);

    return rooms.findOne({ roomName: roomName });
  }
};
