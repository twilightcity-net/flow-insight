const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  TeamDto = require("../dto/TeamDto"),
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
      TeamController.wireControllersTogether();
    }
  }

  /**
   * ours static string paths for this client
   * @returns {{JOURNAL: string, ME: string, LIMIT: string}}
   * @constructor
   */
  static get Paths() {
    return {
      TEAM: "/team",
      SEPARATOR: "/"
    };
  }

  static get Types() {
    return {
      PRIMARY:"primary"
    };
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_RECENT_INTENTIONS: string, LOAD_RECENT_JOURNAL: string, GET_RECENT_TASKS: string, GET_RECENT_PROJECTS: string}}
   * @constructor
   */
  static get EventTypes() {
    return {
      LOAD_RECENT_JOURNAL: "load-recent-journal",
      GET_RECENT_INTENTIONS: "get-recent-intentions"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
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

  getDatabase() {

  }
  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTeamClientEvent(event, arg) {
    log.info(chalk.yellowBright(this.name) + " event : " + JSON.stringify(arg));
    if (!arg.args) {
      this.handleError("arg : args is required", event, arg);
    } else {
      switch (arg.type) {
        case TeamController.EventTypes.LOAD_RECENT_JOURNAL:
          this.handleLoadMyTeamEvent(event, arg);
          break;
        case TeamController.EventTypes.GET_RECENT_INTENTIONS:
          this.handleGetMyTeamEvent(event, arg);
          break;
        default:
          throw new Error("Unknown team client event type '" + arg.type + "'.");
      }
    }
  }

  /**
   * processes the create journal events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMyTeamEvent(event, arg, callback) {
    let type = arg.args.type,
      id = arg.args.id,
      name = arg.args.name,
      urn = TeamController.Paths.TEAM;

    if (type !== TeamController.Types.PRIMARY) {
      urn += TeamController.Paths.SEPARATOR;
      if (id) {
        urn += id;
      } else {
        urn += name;
      }
    }

    this.doClientRequest(
      "TeamClient",
      {},
      "getMyTeam",
      "get",
      urn,
      store => {
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
    );
  }

  /**
   * gets one of our teams that is stored in the database, or fetch from grid
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyTeamEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.TEAM),
      userName = arg.args.userName,
      view = database.getViewForIntentionsByUserName(userName);

    if (!userName) {
      arg.error = "Unknown user '" + userName + "'";
      this.doCallbackOrReplyTo(event, arg, callback);
    } else if (userName === TeamController.Paths.ME) {
      log.info(
        chalk.yellowBright(this.name) +
          " '" +
          arg.type +
          "' : '" +
          arg.id +
          "' -> {" +
          view.count() +
          "}"
      );
      arg.data = view.data();
      this.doCallbackOrReplyTo(event, arg, callback);
    } else {
      this.handleLoadJournalEvent(
        null,
        { args: { userName: userName } },
        args => {
          if (args.error && event) {
            arg.error = args.error;
            this.doCallbackOrReplyTo(event, arg);
          } else {
            log.info(
              chalk.yellowBright(this.name) +
                " '" +
                arg.type +
                "' : '" +
                arg.id +
                "' -> {" +
                view.count() +
                "}"
            );
            arg.data = view.data();
            this.doCallbackOrReplyTo(event, arg);
          }
        }
      );
    }
  }
};
