const Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
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
      JournalController.wireTogetherControllers();
      JournalController.instance.userHistory = new Set();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_RECENT_INTENTIONS: string, LOAD_RECENT_JOURNAL: string, GET_RECENT_TASKS: string, GET_RECENT_PROJECTS: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_RECENT_JOURNAL: "load-recent-journal",
      CREATE_INTENTION: "create-intention",
      CREATE_TASK_REFERENCE: "create-task-reference",
      GET_RECENT_INTENTIONS: "get-recent-intentions",
      GET_RECENT_PROJECTS: "get-recent-projects",
      GET_RECENT_TASKS: "get-recent-tasks"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      JournalController.instance
    );
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
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        JournalController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case JournalController.Events.LOAD_RECENT_JOURNAL:
          this.handleLoadJournalEvent(event, arg);
          break;
        case JournalController.Events.CREATE_INTENTION:
          this.handleCreateIntentionEvent(event, arg);
          break;
        case JournalController.Events.CREATE_TASK_REFERENCE:
          this.handleCreateTaskReferenceEvent(event, arg);
          break;
        case JournalController.Events.GET_RECENT_INTENTIONS:
          this.handleGetRecentIntentionsEvent(event, arg);
          break;
        case JournalController.Events.GET_RECENT_PROJECTS:
          this.handleGetRecentProjectsEvent(event, arg);
          break;
        case JournalController.Events.GET_RECENT_TASKS:
          this.handleGetRecentTasksEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown journal client event type '" +
              arg.type +
              "'."
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
      urn += JournalController.Params.LIMIT + limit;
    }

    this.doClientRequest(
      "JournalClient",
      {},
      "getRecentJournal",
      JournalController.Types.GET,
      urn,
      store =>
        this.delegateLoadJournalCallback(
          store,
          userName,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto client callback for our rest request
   * @param store
   * @param userName
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadJournalCallback(
    store,
    userName,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let journal = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.JOURNAL
        ),
        collection = database.getCollection(
          JournalDatabase.Collections.INTENTIONS
        ),
        view = database.findOrCreateViewForIntentionsByUserName(
          userName
        );

      if (journal.recentIntentions) {
        if (view.count() !== 0) {
          collection.removeBatch(view.data());
        }
        journal.recentIntentions.forEach(ri => {
          ri.timestamp = Util.getTimestampFromUTCStr(
            ri.positionStr
          );
          ri.userName = userName;
          collection.insert(ri);
        });
      }

      if (journal.recentProjects) {
        collection = database.getCollection(
          JournalDatabase.Collections.PROJECTS
        );
        view = database.getViewForRecentProjects();
        if (view.count() !== 0) {
          collection.removeBatch(view.data());
        }
        journal.recentProjects.forEach(rp => {
          collection.insert(rp);
        });
      }

      if (journal.recentTasksByProjectId) {
        collection = database.getCollection(
          JournalDatabase.Collections.TASKS
        );
        view = database.getViewForRecentTasks();
        this.updateRecentTasksByProjectId(
          view,
          collection,
          journal
        );
      }
    }
    JournalController.instance.userHistory.add(userName);
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * updates our recent tasks in our database based on some model data
   * @param view
   * @param collection
   * @param model
   */
  updateRecentTasksByProjectId(view, collection, model) {
    if (view.count() !== 0) {
      collection.removeBatch(view.data());
    }
    Object.values(model.recentTasksByProjectId).forEach(
      project => {
        if (project) {
          project.forEach(rt => {
            collection.insert(rt);
          });
        }
      }
    );
  }

  /**
   * client event handler for our create new intention function
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateIntentionEvent(event, arg, callback) {
    let projectId = arg.args.projectId,
      taskId = arg.args.taskId,
      description = arg.args.description,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Strings.ME +
        JournalController.Paths.INTENTION;

    this.doClientRequest(
      "JournalClient",
      {
        description: description,
        projectId: projectId,
        taskId: taskId
      },
      "createIntention",
      JournalController.Types.POST,
      urn,
      store =>
        this.delegateCreateIntentionCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateCreateIntentionCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      arg.data = store.data;
      this.handleLoadJournalEvent(
        null,
        {
          args: { userName: JournalController.Strings.ME }
        },
        () => {
          this.delegateCallbackOrEventReplyTo(
            event,
            arg,
            callback
          );
        }
      );
    }
  }

  /**
   * created a new task in our gridtime and local db
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateTaskReferenceEvent(event, arg, callback) {
    let taskName = arg.args.taskName,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Strings.ME +
        JournalController.Paths.TASKREF;

    this.doClientRequest(
      "JournalClient",
      { taskName: taskName },
      "createTaskReference",
      JournalController.Types.POST,
      urn,
      store =>
        this.delegateCreateTaskReferenceCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles the callback of the create intention
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateCreateTaskReferenceCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.JOURNAL
        ),
        collection = database.getCollection(
          JournalDatabase.Collections.TASKS
        ),
        summary = store.data,
        view = database.getViewForRecentTasks();

      if (summary.recentTasksByProjectId) {
        this.updateRecentTasksByProjectId(
          view,
          collection,
          summary
        );
      }

      arg.data = view.data();
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }
  }

  /**
   * gets our recent intentions for a user
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentIntentionsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      ),
      userName = arg.args.userName,
      view = database.findOrCreateViewForIntentionsByUserName(
        userName
      );

    if (!userName) {
      arg.error = "Unknown user '" + userName + "'";
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else if (userName === JournalController.Strings.ME) {
      this.logResults(
        this.name,
        arg.type,
        arg.id,
        view.count()
      );
      arg.data = view.data();
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      if (
        JournalController.instance.userHistory.has(
          userName
        ) &&
        view.count() !== 0
      ) {
        this.logResults(
          this.name,
          arg.type,
          arg.id,
          view.count()
        );
        arg.data = view.data();
        this.delegateCallbackOrEventReplyTo(event, arg);
      } else {
        this.handleLoadJournalEvent(
          null,
          { args: { userName: userName } },
          args =>
            this.delegateCallbackWithView(
              args,
              view,
              event,
              arg
            )
        );
      }
    }
  }

  /**
   * queries our local database for recent projects
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentProjectsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      ),
      view = database.getViewForRecentProjects();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      view.count()
    );
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * queries for our recent task in our local database for the dropdown in the journal
   * resource view
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentTasksEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      ),
      view = database.getViewForRecentTasks();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      view.count()
    );
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
