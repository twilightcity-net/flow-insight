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
   * @returns {{PARTICIPATING: string, ACTIVE: string, SEPARATOR: string, TASKREF: string, CIRCUIT_WTF: string, JOURNAL: string, CHAT: string, WTF: string, JOIN: string, TALK: string, MY: string, MEMBER: string, DO_IT_LATER: string, INTENTION: string, CANCEL: string, LEAVE: string, ME: string, TEAM: string, TO: string, ROOM: string, HOME: string, CIRCUIT: string}}
   * @constructor
   */
  static get Paths() {
    return {
      JOURNAL: "/journal/",
      TEAM: "/team",
      SEPARATOR: "/",
      INTENTION: "/intention",
      TASKREF: "/taskref",
      CIRCUIT: "/circuit",
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
      HOME: "/home",
      MEMBER: "/member",
      ME: "/me"
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
      GET: "get",
      POST: "post"
    };
  }

  /**
   * our possible message type for our controller reference
   * @returns {{WTF_STATUS_UPDATE: string, ROOM_MEMBER_STATUS_EVENT: string, TEAM_MEMBER: string, CIRCUIT_STATUS: string, CHAT_MESSAGE_DETAILS: string, XP_STATUS_UPDATE: string}}
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      ROOM_MEMBER_STATUS_EVENT: "RoomMemberStatusEventDto",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto",
      TEAM_MEMBER: "TeamMemberDto",
      XP_STATUS_UPDATE: "XPStatusUpdateDto",
      WTF_STATUS_UPDATE: "WTFStatusUpdateDto"
    };
  }

  /**
   * errors which the controllers know about
   * @returns {{UNKNOWN_STATUS_TYPE: string, UNKNOWN_STATE_TYPE: string, UNKNOWN_TALK_MESSAGE_TYPE: string, UNKNOWN_TALK_TO_EVENT: string, UNKNOWN: string, UNKNOWN_CIRCUIT_EVENT: string, ERROR_ARGS: string, INVALID_PARTICIPATING_CIRCUIT: string}}
   * @constructor
   */
  static get Error() {
    return {
      ERROR_ARGS: "arg : args is required",
      UNKNOWN: "Unknown team client event type",
      UNKNOWN_CIRCUIT_EVENT:
        "Unknown circuit client event type",
      UNKNOWN_TALK_MESSAGE_TYPE:
        "Unknown talk message type",
      UNKNOWN_STATUS_TYPE: "Unknown status type",
      UNKNOWN_STATE_TYPE: "Unknown state type",
      UNKNOWN_TALK_TO_EVENT:
        "Unknown talk to client event type",
      INVALID_PARTICIPATING_CIRCUIT:
        "Invalid get my participating circuits event"
    };
  }

  /**
   * general purpose strings that should prolly go in the {Util}
   * @returns {{ME: string, MY: string}}
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
   * @returns {{GET_MY_HOME_TEAM_CIRCUIT: string, JOIN_EXISTING_ROOM: string, GET_ALL_TALK_MESSAGES_FROM_ROOM: string, CANCEL_WTF: string, START_WTF: string, GET_CIRCUIT_WITH_ALL_DETAILS: string, GET_ACTIVE_CIRCUIT: string, START_WTF_WITH_CUSTOM_CIRCUIT_NAME: string, GET_ALL_MY_TEAM_CIRCUITS: string, GET_ALL_MY_PARTICIPATING_CIRCUITS: string, GET_MY_HOME_TEAM: string, GET_ALL_MY_TEAMS: string, GET_ALL_MY_DO_IT_LATER_CIRCUITS: string, PAUSE_WTF: string, LEAVE_EXISTING_ROOM: string, GET_ME: string}}
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
      GET_ALL_MY_TEAMS: "getAllMyTeams",
      GET_ME: "getMe",
      GET_MY_HOME_TEAM_CIRCUIT: "getMyHomeTeamCircuit",
      GET_ALL_MY_TEAM_CIRCUITS: "getAllMyTeamCircuits"
    };
  }

  /**
   * a list of our various circuit status types
   * @returns {{CANCELED: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get StatusTypes() {
    return {
      TEAM_WTF_STARTED: "TEAM_WTF_STARTED",
      TEAM_WTF_STOPPED: "TEAM_WTF_STOPPED"
    };
  }

  /**
   * a list of our various circuit states
   * @returns {{CANCELED: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get CircuitStates() {
    return {
      TROUBLESHOOT: "TROUBLESHOOT",
      CANCELED: "CANCELED"
    };
  }

  /**
   * our possible client context scopes used by gridtime clients
   * @returns {{TEAM_CIRCUIT_CLIENT: string, CIRCUIT_CLIENT: string, TEAM_CLIENT: string, MEMBER_CLIENT: string, TALK_TO_CLIENT: string}}
   * @constructor
   */
  static get Contexts() {
    return {
      CIRCUIT_CLIENT: "CircuitClient",
      TALK_TO_CLIENT: "TalkToClient",
      TEAM_CLIENT: "TeamClient",
      TEAM_CIRCUIT_CLIENT: "TeamCircuitClient",
      MEMBER_CLIENT: "MemberClient"
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
   * queries for a specific doc and determines if we should insert the model
   * into the collection or not. we are under the assumption that each one of
   * these talk doc records does not mutate over time. The id is fixed in
   * time as you could say
   * @param model
   * @param collection
   * @param doc
   */
  findXOrInsertDoc(model, collection, doc) {
    model = collection.findOne({ id: doc.id });
    if (!model) {
      collection.insert(doc);
    }
  }

  /**
   * finds a document doc, and removes it, then inserts
   * @param model
   * @param collection
   * @param doc
   */
  findRemoveXInsertDoc(model, collection, doc) {
    model = collection.findOne({ id: doc.id });
    if (model) {
      collection.remove(model);
    }
    model = Object.assign({}, doc);
    collection.insert(model);
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

    if (!room && roomName && uri) {
      rooms.insert({
        roomName: roomName,
        uri: uri
      });
    }
  }

  /**
   * checks our database to see if we have a room for the night.
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

  /**
   * resets the isHomeTeam flag on any document collection
   * @param doc
   * @param collection
   */
  resetHomeTeamFlag(doc, collection) {
    let results = collection.find({ isHomeTeam: true });
    results.forEach(t => {
      t.isHsomeTeam = false;
      collection.update(t);
    });
  }
};
