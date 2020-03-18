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
   * @returns {{LOAD_ALL_MY_DO_IT_LATER_CIRCUITS: string, LOAD_ALL_MY_PARTICIPATING_CIRCUITS: string, LOAD_CIRCUIT_WITH_ALL_DETAILS: string, CREATE_CIRCUIT: string, LOAD_ACTIVE_CIRCUIT: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_ALL_TALK_MESSAGES_FROM_ROOM: "load-all-talk-messages-from-room",
      GET_ALL_TALK_MESSAGES_FROM_ROOM: "get-all-talk-messages-from-room"
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
        collection = database.getCollectionForRoomTalkMessages(roomName),
        view = database.getViewTalkMessagesForCollection(collection),
        messages = store.data,
        message = messages[0],
        uri = message.uri;

      if (messages && message) {
        this.addRoomToRooms(roomName, uri);
        for (let i = 0, m, len = messages.length; i < len; i++) {
          message = messages[i];
          m = collection.findOne({ id: message.id });
          if (!m) {
            collection.insert(message);
          }
        }
      }
      this.logResults(this.name, arg.type, arg.id, view.count());
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
      collection = database.getCollection(
        TalkDatabase.Collections.TALK_MESSAGES
      ),
      view = database.getViewTalkMessages(),
      room = collection.findOne({ roomName: roomName });

    if (room) {
      console.log("have messages");
    } else {
      console.log("need messages");
    }

    this.logResults(this.name, arg.type, arg.id, view.count());
    arg.data = [];
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  addRoomToRooms(roomName, uri) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TALK);
    let rooms = database.getCollection(TalkDatabase.Collections.ROOMS);
    let room = rooms.findOne({ uri: uri });

    if (!room) {
      rooms.insert({ roomName, uri });
    }
  }
};
