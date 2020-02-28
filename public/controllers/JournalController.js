const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  RecentJournalDto = require("../dto/RecentJournalDto"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  JournalDatabase = require("../database/JournalDatabase");

/**
 * This class is used to coordinate controllers across the journal service
 * @type {JournalController}
 */
module.exports = class JournalController extends BaseController {
  /**
   * builds our Journal Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, JournalController);
    if (!JournalController.instance) {
      JournalController.instance = this;
      JournalController.wireControllersTogether();
      JournalController.instance.userHistory = new Set();
    }
  }

  /**
   * ours static string paths for this client
   * @returns {{JOURNAL: string, ME: string, LIMIT: string}}
   * @constructor
   */
  static get Paths() {
    return {
      JOURNAL: "/journal/",
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
    BaseController.wireControllersTo(JournalController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(JournalController.instance);
    this.journalClientEventListener = EventFactory.createEvent(
      EventFactory.Types.JOURNAL_CLIENT,
      this,
      this.onJournalClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onJournalClientEvent(event, arg) {
    log.info(chalk.yellowBright(this.name) + " event : " + JSON.stringify(arg));
    if (!arg.args) {
      this.handleError("arg : args is required", event, arg);
    } else {
      switch (arg.type) {
        case JournalController.EventTypes.LOAD_RECENT_JOURNAL:
          this.handleLoadJournalEvent(event, arg);
          break;
        case JournalController.EventTypes.GET_RECENT_INTENTIONS:
          this.handleGetRecentIntentionsEvent(event, arg);
          break;
        case JournalController.EventTypes.GET_RECENT_PROJECTS:
          this.handleGetRecentProjectsEvent(event, arg);
          break;
        case JournalController.EventTypes.GET_RECENT_TASKS:
          this.handleGetRecentTasksEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown journal client event type '" + arg.type + "'."
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
  handleLoadJournalEvent(event, arg, callback) {
    let userName = arg.args.userName,
      limit = arg.args.limit,
      urn = JournalController.Paths.JOURNAL + userName;

    if (limit) {
      urn += JournalController.Paths.LIMIT + limit;
    }

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
            database = DatabaseFactory.getDatabase(DatabaseFactory.Names.JOURNAL),
            collection = null;

          if (journal.recentIntentions) {
            collection = database.getCollection(
              JournalDatabase.Collections.INTENTIONS
            );
            journal.recentIntentions.forEach(ri => {
              ri.timestamp = Util.getTimestampFromUTCStr(ri.positionStr);
              ri.userName = userName;
              collection.insert(ri);
            });
          }
          if (journal.recentIntentions) {
            collection = database.getCollection(JournalDatabase.Collections.PROJECTS);
            journal.recentProjects.forEach(rp => {
              collection.insert(rp);
            });
          }
          if (journal.recentTasksByProjectId) {
            collection = database.getCollection(JournalDatabase.Collections.TASKS);
            Object.values(journal.recentTasksByProjectId).forEach(project => {
              if (project) {
                project.forEach(rt => {
                  collection.insert(rt);
                });
              }
            });
          }
        }
        JournalController.instance.userHistory.add(userName);
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
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.JOURNAL),
      userName = arg.args.userName,
      view = database.getViewForIntentionsByUserName(userName);

    if (!userName) {
      arg.error = "Unknown user '" + userName + "'";
      this.doCallbackOrReplyTo(event, arg, callback);
    } else if (userName === JournalController.Paths.ME) {
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
        JournalController.instance.userHistory.has(userName) &&
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

  handleGetRecentProjectsEvent(event, arg, callback) {}

  handleGetRecentTasksEvent(event, arg, callback) {}
};
