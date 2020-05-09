const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory"),
  TalkDatabase = require("../database/TalkDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate controllers across the app classes
 * @type {BaseController}
 */
module.exports = class BaseController {
  /**
   * REST paths for our grid server. good place to store thats shared amoung all controllers
   * @returns {{PARTICIPATING: string, ACTIVE: string, SEPARATOR: string, TASKREF: string, CIRCUIT_WTF: string, JOURNAL: string, CHAT: string, WTF: string, JOIN: string, TALK: string, STATUS: string, DO_IT_LATER: string, INTENTION: string, CANCEL: string, LEAVE: string, TEAM: string, TO: string, STATUS_TEAM: string, ROOM: string, HOME: string, CIRCUIT: string}}
   * @constructor
   */
  static get Paths() {
    return {
      JOURNAL: "/journal/",
      TEAM: "/team",
      SEPARATOR: "/",
      STATUS: "/status/",
      STATUS_TEAM: "/status/team",
      INTENTION: "/intention",
      TASKREF: "/taskref",
      CIRCUIT: "/circuit/",
      CIRCUIT_WTF: "/circuit/wtf",
      PARTICIPATING: "/participating",
      DO_IT_LATER: "/doitlater",
      ACTIVE: "/active",
      WTF: "wtf/",
      TALK: "/talk",
      MY: "/my",
      TO: "/to",
      ROOM: "/room",
      CHAT: "/chat",
      JOIN: "/join",
      LEAVE: "/leave",
      CANCEL: "/cancel",
      HOME: "/home"
    };
  }

  /**
   * various request parameter strings our controllers use
   * @returns {{LIMIT: string}}
   * @constructor
   */
  static get Params() {
    return {
      LIMIT: "?limit="
    };
  }

  /**
   * Data types flag
   * @returns {{POST: string, GET: string, PRIMARY: string}}
   * @constructor
   */
  static get Types() {
    return {
      PRIMARY: "primary",
      GET: "get",
      POST: "post"
    };
  }

  /**
   * our possible message type for our controller reference
   * @returns {{CIRCUIT_STATUS: string, ROOM_MEMBER_STATUS: string}}
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      ROOM_MEMBER_STATUS: "RoomMemberStatus",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto"
    };
  }

  /**
   * our enum of gridtime Circuit Message Types that talk broadcasts
   * @returns {{TEAM_MEMBER_STATUS_UPDATE: string, WTF_STARTED: string, TEAM_MEMBER_XP_UPDATE: string, CHAT: string, TEAM_WTF_RESUMED: string, ROOM_MEMBER_JOIN: string, ROOM_MEMBER_ONLINE: string, TEAM_WTF_STOPPED: string, WTF_RESUMED: string, WTF_SOLVED: string, SCREENSHOT: string, TEAM_RETRO_STARTED: string, SNIPPET: string, ROOM_MEMBER_LEAVE: string, TEAM_INTENTION_STARTED: string, WTF_RETRO_STARTED: string, WTF_ONHOLD: string, ROOM_MEMBER_OFFLINE: string, WTF_CANCELED: string, TEAM_WTF_STARTED: string}}
   * @constructor
   */
  static get CircuitMessageTypeDto() {
    return {
      CHAT: "ChatMessageDetailsDto",
      SCREENSHOT: "ScreenshotMessageDetailsDto",
      SNIPPET: "SnippetMessageDetailsDto",
      ROOM_MEMBER_JOIN: "RoomMemberStatus",
      ROOM_MEMBER_LEAVE: "RoomMemberStatus",
      ROOM_MEMBER_OFFLINE: "RoomMemberStatus",
      ROOM_MEMBER_ONLINE: "RoomMemberStatus",
      WTF_STARTED: "CircuitStatusDto",
      WTF_SOLVED: "CircuitStatusDto",
      WTF_ONHOLD: "CircuitStatusDto",
      WTF_RESUMED: "CircuitStatusDto",
      WTF_RETRO_STARTED: "CircuitStatusDto",
      WTF_CANCELED: "CircuitStatusDto",
      TEAM_INTENTION_STARTED: "IntentionStartedDetailsDto",
      TEAM_WTF_STARTED: "WTFStatusUpdateDto",
      TEAM_WTF_STOPPED: "WTFStatusUpdateDto",
      TEAM_WTF_RESUMED: "WTFStatusUpdateDto",
      TEAM_RETRO_STARTED: "WTFStatusUpdateDto",
      TEAM_MEMBER_STATUS_UPDATE: "MemberWorkStatusDto",
      TEAM_MEMBER_XP_UPDATE: "XPStatusUpdateDto"
    };
  }

  /**
   * errors which the controllers know about
   * @returns {{UNKNOWN: string, ERROR_ARGS: string, PRIMARY_ONLY: string}}
   * @constructor
   */
  static get Error() {
    return {
      ERROR_ARGS: "arg : args is required",
      UNKNOWN: "Unknown team client event type",
      UNKNOWN_CIRCUIT_EVENT:
        "Unknown circuit client event type",
      UNKNOWN_TALK_TO_EVENT:
        "Unknown talk to client event type",
      PRIMARY_ONLY: "Only primary team supported currently",
      INVALID_PARTICIPATING_CIRCUIT:
        "Invalid get my participating circuits event"
    };
  }

  /**
   * general purpose strings that should prolly go in the {Util}
   * @returns {{ME: string}}
   * @constructor
   */
  static get Strings() {
    return {
      ME: "me",
      MY: "my"
    };
  }

  /**
   * definition names of our controllers functions
   * @returns {{GET_ACTIVE_CIRCUIT: string, START_WTF_WITH_CUSTOM_CIRCUIT_NAME: string, JOIN_EXISTING_ROOM: string, GET_ALL_MY_PARTICIPATING_CIRCUITS: string, GET_ALL_TALK_MESSAGES_FROM_ROOM: string, GET_ALL_MY_DO_IT_LATER_CIRCUITS: string, CANCEL_WTF: string, PAUSE_WTF: string, START_WTF: string, GET_CIRCUIT_WITH_ALL_DETAILS: string}}
   * @constructor
   */
  static get Names() {
    return {
      START_WTF: "startWTF",
      START_WTF_WITH_CUSTOM_CIRCUIT_NAME:
        "startWTFWithCustomCircuitName",
      GET_ALL_MY_PARTICIPATING_CIRCUITS:
        "getAllMyParticipatingCircuits",
      GET_ALL_MY_DO_IT_LATER_CIRCUITS:
        "getAllMyDoItLaterCircuits",
      GET_ACTIVE_CIRCUIT: "getActiveCircuit",
      GET_CIRCUIT_WITH_ALL_DETAILS:
        "getCircuitWithAllDetails",
      GET_ALL_TALK_MESSAGES_FROM_ROOM:
        "getAllTalkMessagesFromRoom",
      CANCEL_WTF: "cancelWtf",
      PAUSE_WTF: "pauseWtf",
      JOIN_EXISTING_ROOM: "joinExistingRoom",
      LEAVE_EXISTING_ROOM: "leaveExistingRoom",
      GET_MY_HOME_TEAM: "getMyHomeTeam",
      GET_ALL_MY_TEAMS: "getAllMyTeams"
    };
  }

  /**
   * our possible client context scopes used by gridtime clients
   * @returns {{CIRCUIT_CLIENT: string}}
   * @constructor
   */
  static get Contexts() {
    return {
      CIRCUIT_CLIENT: "CircuitClient",
      TALK_TO_CLIENT: "TalkToClient",
      TEAM_CLIENT: "TeamClient"
    };
  }

  /**
   * our base class all controllers extend
   * @param scope
   * @param clazz
   */
  constructor(scope, clazz) {
    this.name = "[" + clazz.name + "]";
    this.scope = scope;
    this.guid = Util.getGuid();
  }

  /**
   * called for every controller automagically
   * @param clazz
   */
  static wireControllersTo(clazz) {
    log.info(
      "[" +
        BaseController.name +
        "] wire controllers to -> " +
        clazz.name
    );
  }

  /**
   * called for every controller automagically
   * @param clazz
   */
  static configEvents(clazz) {
    log.info(
      "[" +
        BaseController.name +
        "] configure events for -> " +
        clazz.name
    );
  }

  /**
   * this function makes a request to the Journal Client interface on gridtime
   * server. This will be worked into our existing data client and model system.
   * @param context
   * @param dto
   * @param name
   * @param type
   * @param urn
   * @param callback
   */
  doClientRequest(context, dto, name, type, urn, callback) {
    let store = {
      context: context,
      dto: dto,
      guid: Util.getGuid(),
      name: name,
      requestType: type,
      timestamp: new Date().getTime(),
      urn: urn
    };
    let client = new DtoClient(store, callback);
    client.doRequest();
  }

  /**
   * handles a generic error for any of our controllers
   * @param message
   * @param event
   * @param arg
   * @param callback
   */
  handleError(message, event, arg, callback) {
    arg.error = message;
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * logs a generate controller request from the system
   * @param name
   * @param arg
   */
  logRequest(name, arg) {
    log.info(
      chalk.yellowBright(name) +
        " event : " +
        JSON.stringify(arg)
    );
  }

  /**
   * logs a generic result from a controller
   * @param name
   * @param type
   * @param id
   * @param count
   */
  logResults(name, type, id, count) {
    log.info(
      chalk.yellowBright(name) +
        " '" +
        type +
        "' : '" +
        id +
        "' -> {" +
        count +
        "}"
    );
  }

  /**
   * performs our callback or makes the event reply
   * @param event
   * @param arg
   * @param callback
   * @returns {Array|*}
   */
  delegateCallbackOrEventReplyTo(event, arg, callback) {
    if (callback) {
      return callback(arg);
    } else if (event) {
      return event.replyTo(arg);
    } else {
      throw new Error("Invalid create client event");
    }
  }

  /**
   * general purpose delegator for controller callbacks
   * @param args
   * @param view
   * @param event
   * @param arg
   */
  delegateCallbackWithView(args, view, event, arg) {
    if (args && args.error && event) {
      arg.error = args.error;
      this.delegateCallbackOrEventReplyTo(event, arg);
    } else {
      this.logResults(
        this.name,
        arg.type,
        arg.id,
        view.count()
      );
      arg.data = view.data();
      this.delegateCallbackOrEventReplyTo(event, arg);
    }
  }

  /**
   * helper function which takes an entire results set and removes it from the
   * given collection
   * @param view
   * @param collection
   */
  batchRemoveFromViewInCollection(view, collection) {
    collection.removeBatch(view.data());
  }

  /**
   * queries for a specific message and determines if we should insert the model
   * into the collection or not. we are under the assumption that each one of
   * these talk message records does not mutate over time. The id is fixed in
   * time as you could say
   * @param model
   * @param collection
   * @param circuit
   */
  findXOrInsertMessage(model, collection, circuit) {
    model = collection.findOne({ id: circuit.id });
    if (!model) {
      collection.insert(circuit);
    }
  }

  /**
   * adds a room to our rooms collection for reference
   * @param roomName
   * @param uri
   */
  findRoomAndInsert(roomName, uri) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TALK
      ),
      rooms = database.getCollection(
        TalkDatabase.Collections.ROOMS
      ),
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
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TALK
      ),
      rooms = database.getCollection(
        TalkDatabase.Collections.ROOMS
      );

    return rooms.findOne({ roomName: roomName });
  }
};
