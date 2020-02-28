const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  RecentJournalDto = require("../dto/RecentJournalDto"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  JournalDB = require("../database/JournalDatabase");

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
      TeamController.instance.userHistory = new Set();
    }
  }

  /**
   * ours static string paths for this client
   * @returns {{JOURNAL: string, ME: string, LIMIT: string}}
   * @constructor
   */
  static get Paths() {
    return {
      JOURNAL: "/team",
      LIMIT: "?limit=",
      ME: "me"
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
      GET_RECENT_INTENTIONS: "get-recent-intentions",
      GET_RECENT_PROJECTS: "get-recent-projects",
      GET_RECENT_TASKS: "get-recent-tasks"
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

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTeamClientEvent(event, arg) {
    log.info(chalk.yellowBright(this.name) + " event : " + JSON.stringify(arg));
    if(!arg.args) {
      this.handleError("arg : args is required", event, arg);
    } else {
      switch (arg.type) {
        case TeamController.EventTypes.LOAD_RECENT_JOURNAL:
          this.handleLoadJournalEvent(event, arg);
          break;
        case TeamController.EventTypes.GET_RECENT_INTENTIONS:
          this.handleGetRecentIntentionsEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown team client event type '" + arg.type + "'."
          );
      }
    }
  }

  /**
   * processes the create journal events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadTeamEvent(event, arg, callback) {
    let type = arg.args.type,
      name = arg.args.name,
      id = arg.args.name,
      urn = TeamController.Paths.JOURNAL;

    this.doClientRequest(
      "JournalClient",
      {},
      "getRecentJournal",
      "get",
      urn,
      store => {
        if (store.error) {
          arg.error = store.error;
        } else {
          let journal = new RecentJournalDto(store.data),
            database = global.App.VolumeManager.getVolumeByName(
              DatabaseFactory.Names.JOURNAL
            ),
            collection = database.getCollection(
              JournalDB.Collections.INTENTIONS
            );
          if (journal.recentIntentions) {
            journal.recentIntentions.forEach(ri => {
              ri.timestamp = Util.getTimestampFromUTCStr(ri.positionStr);
              ri.userName = type;
              collection.insert(ri);
            });
          }
        }
        TeamController.instance.userHistory.add(type);
        this.doCallbackOrReplyTo(event, arg, callback);
      }
    );
  }

  /**
   * gets our recent intentions for a user
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentIntentionsEvent(event, arg, callback) {
    let database = global.App.VolumeManager.getVolumeByName(
        DatabaseFactory.Names.JOURNAL
      ),
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
      if (
        TeamController.instance.userHistory.has(userName) &&
        view.count() !== 0
      ) {
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
      } else {
        console.log("->grid");
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
  }
};
