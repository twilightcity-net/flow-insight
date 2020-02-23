const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  RecentJournalDto = require("../dto/RecentJournalDto"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  JournalDB = require("../database/JournalDB");

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
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {String}
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

  /**
   * processes the create journal events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadJournalEvent(event, arg, callback) {
    let me = "me",
      userName = arg.args.userName ? arg.args.userName : me,
      limit = arg.args.limit,
      urn = "/journal/" + userName;

    if (limit) {
      urn += "?limit=" + limit;
    }

    this.doClientRequest(
      "JournalClient",
      userName,
      "getRecentJournal",
      "get",
      urn,
      store => {
        let journal = new RecentJournalDto(store.data),
          database = global.App.VolumeManager.getVolumeByName(
            DatabaseFactory.Names.JOURNAL
          ),
          collection = database.getCollection(JournalDB.Collections.INTENTIONS);

        journal.recentIntentions.forEach(ri => {
          ri.timestamp = Util.getTimestampFromUTCStr(ri.positionStr);
          ri.userName = userName;
          collection.insert(ri);
        });

        collection = database.getCollection(JournalDB.Collections.PROJECTS);
        journal.recentProjects.forEach(rp => {
          collection.insert(rp);
        });

        collection = database.getCollection(JournalDB.Collections.TASKS);
        Object.values(journal.recentTasksByProjectId).forEach(project => {
          project.forEach(rt => {
            collection.insert(rt);
          });
        });

        if (callback) {
          return callback(arg.dto);
        } else if (event) {
          return event.replyTo(arg);
        } else {
          throw new Error("Invalid create journal event");
        }
      }
    );
  }

  handleGetRecentIntentionsEvent(event, arg, callback) {
    let userName = arg.args.userName ? arg.args.userName : "me",
      view = this.database.getViewForIntentionsByUserName(userName);

    console.log(view.data());

    arg.data = view.data();

    if (callback) {
      return callback(arg.data);
    } else if (event) {
      return event.replyTo(arg);
    } else {
      throw new Error("Invalid create journal event");
    }
  }

  handleGetRecentProjectsEvent(event, arg, callback) {}

  handleGetRecentTasksEvent(event, arg, callback) {}
};
