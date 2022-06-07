const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory"),
  TalkDatabase = require("../database/TalkDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate controllers across the app classes.
 * @type {BaseController}
 */
module.exports = class BaseController {
  /**
   * Retrieves path information for various urls used with gridtime.
   * @constructor
   */
  static get Paths() {
    return {
      JOURNAL: "/journal",
      TEAM: "/team",
      SEPARATOR: "/",
      INTENTION: "/intention",
      CIRCUIT: "/circuit",
      GLOBAL: "/global",
      CIRCUIT_WTF: "/circuit/wtf",
      PARTICIPATING: "/participating",
      DO_IT_LATER: "/doitlater",
      RESUME: "/resume",
      RESTART: "/restart",
      RETRO: "/retro",
      PROJECT: "/project",
      TASK: "/task",
      WTF: "wtf/",
      WTF_PATH: "/wtf",
      TALK: "/talk",
      MY: "/my",
      TO: "/to",
      ROOM: "/room",
      MESSAGE: "/message",
      CHAT: "/chat",
      JOIN: "/join",
      LEAVE: "/leave",
      START: "/start",
      PAUSE: "/pause",
      SOLVE: "/solve",
      CANCEL: "/cancel",
      MARK: "/mark",
      CLOSE: "/close",
      HOME: "/home",
      MEMBER: "/member",
      ME: "/me",
      TRANSITION: "/transition",
      FLAME: "/flame",
      FINISH: "/finish",
      PROPERTY: "/property",
      DESCRIPTION: "/description",
      TAGS: "/tags",
      TAG: "/tag",
      FERVIE: "/fervie",
      MOOVIE: "/moovie",
      DICTIONARY: "/dictionary",
      SCOPE: "/scope",
      CHART: "/chart",
      FRICTION: "/friction",
      TERMINAL: "/terminal",
      RUN: "/run",
      MANUAL: "/manual",
      SET: "/set",
      QUERY: "/query",
      TOP: "/top",
      BOX: "/box",
      MODULE: "/module",
      FILE: "/file",
      IN: "/in",
      FAMILIARITY: "/familiarity",
      PAIR: "/pair",
      REQUEST: "/request",
      CONFIRM: "/confirm",
      LINK: "/link",
      UNLINK: "/unlink",
      CLAIM: "/claim",
      RELEASE: "/release",
      PUPPET: "/puppet",
      SEAT: "/seat",
      BUDDY: "/buddy",
      INVITE: "/invite",
      WITH: "/with",
      EMAIL: "/email"
    };
  }

  /**
   * various request parameter strings our controllers use
   * @returns {{LIMIT: string}}
   * @constructor
   */
  static get Params() {
    return {
      LIMIT: "?limit=",
    };
  }

  /**
   * Data types flag
   * @returns {{POST: string, GET: string}}
   * @constructor
   */
  static get Types() {
    return {
      GET: "get",
      POST: "post",
    };
  }

  /**
   * our possible message type for our controller reference
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      CIRCUIT_MEMBER_STATUS_EVENT:
        "CircuitMemberStatusEventDto",
      ROOM_MEMBER_STATUS_EVENT: "RoomMemberStatusEventDto",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto",
      PUPPET_MESSAGE: "PuppetMessageDto",
      TEAM_MEMBER: "TeamMemberDto",
      TEAM_MEMBER_ADDED: "TeamMemberAddedEventDto",
      TEAM_MEMBER_REMOVED: "TeamMemberRemovedEventDto",
      XP_STATUS_UPDATE: "XPStatusUpdateDto",
      WTF_STATUS_UPDATE: "WTFStatusUpdateDto",
      INTENTION_STARTED_DETAILS:
        "IntentionStartedDetailsDto",
      INTENTION_FINISHED_DETAILS:
        "IntentionFinishedDetailsDto",
      INTENTION_ABORTED_DETAILS:
        "IntentionAbortedDetailsDto",
      JOURNAL_ENTRY_DTO: "JournalEntryDto",
      DICTIONARY_UPDATE: "WordDefinitionDto",
      TERMINAL_CMD_RESULT: "TerminalResultsDto",
      TERMINAL_ENVVARIABLE: "EnvironmentVariableDto",
      TERMINAL_CIRCUIT_CLOSED: "CircuitClosedDto",
      PAIRING_REQUEST: "PairingRequestDto",
      FERVIE_SEAT_EVENT: "FervieSeatEventDto",
      MOOVIE_STATUS_UPDATE: "MoovieCircuitDto",
      CHAT_REACTION: "ChatReactionDto",
      PENDING_BUDDY_REQUEST: "PendingBuddyRequestDto",
      BUDDY_CONFIRMATION_REQUEST: "BuddyConfirmationRequestDto",
      BUDDY_STATUS_EVENT: "BuddyEventDto"
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
        "Invalid get my participating circuits event",
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
      MY: "my",
    };
  }

  /**
   * define the names of our controllers functions for gridtime
   * @constructor
   */
  static get Names() {
    return {
      START_WTF: "startWTF",
      START_WTF_WITH_CUSTOM_CIRCUIT_NAME:
        "startWTFWithCustomCircuitName",
      JOIN_WTF: "joinWTF",
      LEAVE_WTF: "leaveWTF",
      GET_ALL_MY_PARTICIPATING_CIRCUITS:
        "getAllMyParticipatingCircuits",
      GET_ALL_MY_DO_IT_LATER_CIRCUITS:
        "getAllMyDoItLaterCircuits",
      GET_ALL_MY_RETRO_CIRCUITS: "getAllMyRetroCircuits",
      GET_ALL_MY_SOLVED_CIRCUITS: "getAllMySolvedCircuits",
      GET_ACTIVE_CIRCUIT: "getActiveCircuit",
      GET_CIRCUIT_WITH_ALL_DETAILS:
        "getCircuitWithAllDetails",
      GET_CIRCUIT_TASK_SUMMARY: "getCircuitTaskSummary",
      GET_ALL_TALK_MESSAGES_FROM_ROOM:
        "getAllTalkMessagesFromRoom",
      GET_CIRCUIT_MEMBERS: "getCircuitMembers",
      SOLVE_WTF: "solveWtf",
      CANCEL_WTF: "cancelWtf",
      CLOSE_WTF: "closeWtf",
      PAUSE_WTF_WITH_DO_IT_LATER: "pauseWTFWithDoItLater",
      RESUME_WTF: "resumeWTF",
      START_RETRO_FOR_WTF: "startRetroForWTF",
      PUBLISH_CHAT_TO_ROOM: "publishChatToRoom",
      PUBLISH_PUPPET_CHAT_TO_ROOM: "publishPuppetChatToRoom",
      REACT_TO_MESSAGE: "reactToMessage",
      JOIN_EXISTING_ROOM: "joinExistingRoom",
      LEAVE_EXISTING_ROOM: "leaveExistingRoom",
      GET_MY_HOME_TEAM: "getMyHomeTeam",
      GET_ALL_MY_TEAMS: "getAllMyTeams",
      GET_ME: "getMe",
      GET_MY_HOME_TEAM_CIRCUIT: "getMyHomeTeamCircuit",
      GET_ALL_MY_TEAM_CIRCUITS: "getAllMyTeamCircuits",
      FIND_OR_CREATE_TASK: "findOrCreateTask",
      FIND_OR_CREATE_PROJECT: "findOrCreateProject",
      FINISH_INTENTION: "finish-intention",
      UPDATE_FLAME_RATING: "update-flame-rating",
      GET_RECENT_PROJECT_TASKS: "getRecentProjectTasks",
      SAVE_FERVIE_DETAILS: "saveFervieDetails",
      GET_BUDDY_LIST: "getBuddyList",
      REQUEST_BUDDY_LINK: "requestBuddyLink",
      CONFIRM_BUDDY_LINK: "confirmBuddyLink",
      REMOVE_BUDDY_LINK: "removeBuddyLink",
      INVITE_TO_BUDDY_LIST_WITH_EMAIL: "inviteToBuddyListWithEmail",
      CREATE_MOOVIE_CIRCUIT: "createMoovieCircuit",
      GET_MOOVIE_CIRCUITS: "getMoovieCircuits",
      GET_MOOVIE_CIRCUIT: "getMoovieCircuit",
      CLAIM_SEAT: "claimSeat",
      RELEASE_SEAT: "releaseSeat",
      GET_SEAT_MAPPINGS: "getSeatMappings",
      JOIN_MOOVIE: "joinMoovie",
      LEAVE_MOOVIE: "leaveMoovie",
      START_MOOVIE: "startMoovie",
      PAUSE_MOOVIE: "pauseMoovie",
      RESUME_MOOVIE: "resumeMoovie",
      RESTART_MOOVIE: "restartMoovie",
      CLAIM_PUPPET: "claimPuppet",
      GET_CIRCUIT_MEMBERS_GLOBAL: "getCircuitMembersGlobal",
      REQUEST_PAIR_LINK: "requestPairLink",
      CONFIRM_PAIR_LINK: "confirmPairLink",
      STOP_PAIRING: "stopPairing",
      CANCEL_PAIR_REQUEST: "cancelPairRequest",
      UPDATE_CIRCUIT_DESCRIPTION:
        "updateCircuitDescription",
      SAVE_CIRCUIT_TAGS: "saveCircuitTags",
      GET_TEAM_DICTIONARY: "getTeamDictionary",
      CHART_WTF: "chartWTF",
      CHART_TASK: "chartTask",
      CHART_TASK_FOR_WTF: "chartTaskForWTF",
      CHART_TOP_BOXES: "chartTopBoxes",
      CHART_TOP_FILES_FOR_BOX: "chartTopFilesForBox",
      CHART_TOP_BOXES_FOR_TEAM: "chartTopBoxesForTeam",
      CHART_TOP_BOXES_FOR_USER: "chartTopBoxesForUser",
      CHART_TOP_FILES_FOR_BOX_FOR_TEAM:
        "chartTopFilesForBoxForTeam",
      CHART_TOP_FILES_FOR_BOX_FOR_USER:
        "chartTopFilesForBoxForUser",
      CHART_TOP_MODULES: "chartTopModules",
      CHART_TOP_MODULES_FOR_TEAM: "chartTopModulesForTeam",
      CHART_TOP_MODULES_FOR_USER: "chartTopModulesForUser",
      CHART_TOP_TAGS: "chartTopTags",
      CHART_TOP_TAGS_FOR_TEAM: "chartTopTagsForTeam",
      CHART_TOP_TAGS_FOR_USER: "chartTopTagsForUser",
      CHART_TOP_TASKS: "chartTopTasks",
      CHART_TOP_TASKS_FOR_TEAM: "chartTopTasksForTeam",
      CHART_TOP_TASKS_FOR_USER: "chartTopTasksForUser",
      CHART_TOP_WTFS_WITH_TAG: "chartTopWtfsWithTag",
      CHART_TOP_WTFS_WITH_TAG_FOR_TEAM:
        "chartTopWtfsWithTagForTeam",
      CHART_TOP_WTFS_WITH_TAG_FOR_USER:
        "chartTopWtfsWithTagForUser",
      CHART_FAMILIARITY: "chartFamiliarity",
      CHART_FAMILIARITY_FOR_TEAM: "chartFamiliarityForTeam",
      CHART_FAMILIARITY_FOR_USER: "chartFamiliarityForUser",
      CHART_TOP_BOXES_FOR_MODULE: "chartTopBoxesForModule",
      CHART_TOP_BOXES_FOR_MODULE_FOR_TEAM:
        "chartTopBoxesForModuleForTeam",
      CHART_TOP_BOXES_FOR_MODULE_FOR_USER:
        "chartTopBoxesForModuleForUser",
      CHART_FRICTION: "chartFriction",
      CHART_FRICTION_FOR_USER: "chartFrictionForUser",
      CHART_FRICTION_FOR_TEAM: "chartFrictionForTeam",
      CREATE_TERMINAL_SESSION: "createTerminalSession",
      RUN_TERMINAL_COMMAND: "runTerminalCommand",
      GET_TERMINAL_COMMAND_MANUAL:
        "getTerminalCommandManual",
      GET_TERMINAL_TTYS: "getTerminalTtys",
      JOIN_TERMINAL_CIRCUIT: "joinTerminalCircuit",
      LEAVE_TERMINAL_CIRCUIT: "leaveTerminalCircuit",
      SET_TERMINAL_ENVIRONMENT_VARIABLE:
        "setTerminalEnvironmentVariable",
    };
  }

  /**
   * possible status events that our circuit members generate in circuits.
   * @returns {{CIRCUIT_MEMBER_LEAVE: string, CIRCUIT_MEMBER_JOINED: string}}
   * @constructor
   */
  static get CircuitMemberStatus() {
    return {
      CIRCUIT_MEMBER_JOIN: "CIRCUIT_MEMBER_JOIN",
      CIRCUIT_MEMBER_LEAVE: "CIRCUIT_MEMBER_LEAVE",
    };
  }

  /**
   * a list of status types that are referenced by the Wtf Status updates.
   * @returns {{TEAM_WTF_PAIR_JOIN:string, TEAM_RETRO_STARTED: string, TEAM_WTF_JOINED: string, TEAM_WTF_ON_HOLD: string, TEAM_WTF_CANCELED: string, TEAM_WTF_RESUMED: string, TEAM_WTF_STARTED: string, TEAM_WTF_LEAVE: string, TEAM_WTF_SOLVED: string}}
   * @constructor
   */
  static get StatusTypes() {
    return {
      TEAM_WTF_STARTED: "TEAM_WTF_STARTED",
      TEAM_WTF_JOINED: "TEAM_WTF_JOINED",
      TEAM_WTF_PAIR_JOIN: "TEAM_WTF_PAIR_JOIN",
      TEAM_WTF_LEAVE: "TEAM_WTF_LEAVE",
      TEAM_WTF_ON_HOLD: "TEAM_WTF_ON_HOLD",
      TEAM_WTF_RESUMED: "TEAM_WTF_RESUMED",
      TEAM_WTF_SOLVED: "TEAM_WTF_SOLVED",
      TEAM_WTF_CANCELED: "TEAM_WTF_CANCELED",
      TEAM_WTF_CLOSED: "TEAM_WTF_CLOSED",
      TEAM_RETRO_CLOSED: "TEAM_RETRO_CLOSED",
      TEAM_RETRO_STARTED: "TEAM_RETRO_STARTED",
      TEAM_WTF_UPDATED: "TEAM_WTF_UPDATED",
      TEAM_WTF_THRESHOLD: "TEAM_WTF_THRESHOLD",
    };
  }

  /**
   * a list of our various circuit states
   * @returns {{CANCELED: string, SOLVED: string, ON_HOLD: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get CircuitStates() {
    return {
      TROUBLESHOOT: "TROUBLESHOOT",
      CANCELED: "CANCELED",
      ON_HOLD: "ONHOLD",
      SOLVED: "SOLVED",
    };
  }

  /**
   * our possible client context scopes used by gridtime clients
   * @constructor
   */
  static get Contexts() {
    return {
      CIRCUIT_CLIENT: "CircuitClient",
      TALK_CLIENT: "TalkClient",
      TALK_TO_CLIENT: "TalkToClient",
      TEAM_CLIENT: "TeamClient",
      TEAM_CIRCUIT_CLIENT: "TeamCircuitClient",
      MEMBER_CLIENT: "MemberClient",
      JOURNAL_CLIENT: "JournalClient",
      DICTIONARY_CLIENT: "DictionaryClient",
      FERVIE_CLIENT: "FervieClient",
      MOOVIE_CLIENT: "MoovieClient",
      CIRCUIT_MEMBER_CLIENT: "CircuitMemberClient",
      CHART_CLIENT: "ChartClient",
      TERMINAL_CLIENT: "TerminalClient",
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
      urn: urn,
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
   * logs a generic message for the named component
   * @param name
   * @param msg
   */
  logMessage(name, msg) {
    log.info(chalk.yellowBright(name) + " msg : " + msg);
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
   * @deprecated
   */
  batchRemoveFromViewInCollection(view, collection) {
    collection.removeBatch(view.data());
  }

  /**
   * queries for a specific doc and determines if we should insert the model
   * into the collection or not. we are under the assumption that each one of
   * these talk doc records does not mutate over time. The id is fixed in
   * time as you could say.
   *
   * please try to start using DatabaseUtil.findInsert() Thank you.
   *
   * @param model
   * @param collection
   * @param doc
   * @deprecated
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
   * @deprecated
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
   * @deprecated
   */
  resetHomeTeamFlag(doc, collection) {
    let results = collection.find({ isHomeTeam: true });
    results.forEach((t) => {
      t.isHomeTeam = false;
      collection.update(t);
    });
  }

  /**
   * gets our user object of ourselves logged in.
   * @returns {Array}
   */
  getMemberMe() {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.MEMBER
      ),
      view = database.getViewForMe();

    return view.data()[0];
  }

  /**
   * gets our local user name that represents ourselves
   * @returns {String}
   */
  getMeUsername() {
    let me = this.getMemberMe();
    if (me) {
      return me.username;
    } else {
      return null;
    }
  }
};
