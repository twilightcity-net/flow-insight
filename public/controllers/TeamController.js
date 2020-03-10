const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  TeamDto = require("../dto/TeamDto"),
  MemberWorkStatusDto = require("../dto/MemberWorkStatusDto"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  TeamDatabase = require("../database/TeamDatabase");

/**
 * This class is used to coordinate controllers across the journal service
 * @type {JournalController}
 */
module.exports = class TeamController extends BaseController {
  /**
   * builds our Journal Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TeamController);
    if (!TeamController.instance) {
      TeamController.instance = this;
      TeamController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{LOAD_MY_TEAM: string, GET_MY_TEAM: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_TEAM: "load-my-team",
      LOAD_MY_CURRENT_STATUS: "load-my-current-status",
      LOAD_STATUS_OF_ME_AND_MY_TEAM: "load-status-of-me-and-my-team",
      GET_MY_TEAM: "get-my-team",
      GET_MY_CURRENT_STATUS: "get-my-current-status",
      GET_STATUS_OF_ME_AND_MY_TEAM: "get-status-of-me-and-my-team"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(TeamController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TeamController.instance);
    this.teamClientEventListener = EventFactory.createEvent(
      EventFactory.Types.TEAM_CLIENT,
      this,
      this.onTeamClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTeamClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(TeamController.Error.ERROR_ARGS, event, arg);
    } else {
      switch (arg.type) {
        case TeamController.Events.LOAD_MY_TEAM:
          this.handleLoadMyTeamEvent(event, arg);
          break;
        case TeamController.Events.LOAD_MY_CURRENT_STATUS:
          this.handleLoadMyCurrentStatus(event, arg);
          break;
        case TeamController.Events.LOAD_STATUS_OF_ME_AND_MY_TEAM:
          this.handleLoadStatusOfMeAndMyTeam(event, arg);
          break;
        case TeamController.Events.GET_MY_TEAM:
          this.handleGetMyTeamEvent(event, arg);
          break;
        case TeamController.Events.GET_MY_CURRENT_STATUS:
          this.handleGetMyCurrentStatusEvent(event, arg);
          break;
        case TeamController.Events.GET_STATUS_OF_ME_AND_MY_TEAM:
          this.handleGetStatusOfMeAndMyTeamEvent(event, arg);
          break;
        default:
          throw new Error(
            TeamController.Error.UNKNOWN + " '" + arg.type + "'."
          );
      }
    }
  }

  /**
   * process team events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMyTeamEvent(event, arg, callback) {
    let type = arg.args.type,
      name = arg.args.id ? arg.args.id : arg.args.name,
      urn = TeamController.Paths.TEAM;

    if (type !== TeamController.Types.PRIMARY) {
      urn += TeamController.Paths.SEPARATOR + name;
    }

    this.doClientRequest("TeamClient", {}, "getMyTeam", "get", urn, store =>
      this.delegateLoadMyTeamCallback(store, event, arg, callback)
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMyTeamCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let team = new TeamDto(store.data),
        database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
        collection = database.getCollection(TeamDatabase.Collections.TEAMS);

      if (team) {
        collection.insert(team);
      }
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * gets our current status of ourselves
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMyCurrentStatus(event, arg, callback) {
    let urn = TeamController.Paths.STATUS + TeamController.Strings.ME;

    this.doClientRequest(
      "TeamClient",
      {},
      "getMyCurrentStatus",
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadMyCurrentStatusCallback(store, event, arg, callback)
    );
  }

  /**
   * callback processor for our current status query
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMyCurrentStatusCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
        collection = database.getCollection(TeamDatabase.Collections.ME),
        view = database.getViewForMyCurrentStatus(),
        member = new MemberWorkStatusDto(store.data),
        me = view.data()[0];

      if (me) {
        me = member;
        collection.update(me);
      } else {
        collection.insert(member);
      }
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * loads our current status and our team status
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadStatusOfMeAndMyTeam(event, arg, callback) {
    let urn = TeamController.Paths.STATUS_TEAM;

    this.doClientRequest(
      "TeamClient",
      {},
      "getStatusOfMeAndMyTeam",
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadStatusOfMeAndMyTeamCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our callback for when when load our team status
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadStatusOfMeAndMyTeamCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
        collection = database.getCollection(TeamDatabase.Collections.MEMBERS),
        view = database.getViewForStatusOfMeAndMyTeam();

      if (view.count() === 0) {
        store.data.forEach(m => {
          collection.insert(new MemberWorkStatusDto(m));
        });
      } else if (store.data.length > 0) {
        store.data.forEach(m => {
          let member = collection.findOne({ id: m.id });
          if (member) {
            member = new MemberWorkStatusDto(m);
            collection.update(member);
          } else {
            collection.insert(new MemberWorkStatusDto(m));
          }
        });
      }
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * gets one of our teams that is stored in the database, or fetch from grid
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyTeamEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
      type = arg.args.type,
      name = arg.args.id ? arg.args.id : arg.args.name;

    if (type === TeamController.Types.PRIMARY) {
      let view = database.getViewForMyPrimaryTeam();
      this.delegateCallback(null, view, event, arg);
    } else {
      arg.error = TeamController.Error.PRIMARY_ONLY;
      this.doCallbackOrReplyTo(event, arg, callback);
    }
  }

  /**
   * queries for our current status in our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyCurrentStatusEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
      view = database.getViewForMyCurrentStatus();

    this.delegateCallback(null, view, event, arg);
  }

  /**
   * queries for our team status from our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetStatusOfMeAndMyTeamEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
      view = database.getViewForStatusOfMeAndMyTeam();

    this.delegateCallback(null, view, event, arg);
  }
};