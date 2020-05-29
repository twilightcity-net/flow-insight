const Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  JournalDatabase = require("../database/JournalDatabase"),
  MemberDatabase = require("../database/MemberDatabase");

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
    let username = arg.args.username,
      limit = arg.args.limit,
      urn = JournalController.Paths.JOURNAL + username;

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
          username,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto client callback for our rest request
   * @param store
   * @param username
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadJournalCallback(
    store,
    username,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let data = store.data,
        recentIntentions = data.recentIntentions,
        recentProjects = data.recentProjects,
        recentTasksByProjectId =
          data.recentTasksByProjectId,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.JOURNAL
        );

      if (recentIntentions && recentIntentions.length > 0) {
        let collection = database.getCollection(
          JournalDatabase.Collections.INTENTIONS
        );
        for (let i = 0; i < recentIntentions.length; i++) {
          // FIXME TEMP
          recentIntentions[
            i
          ].timestamp = Util.getTimestampFromUTCStr(
            recentIntentions[i].positionStr
          );
          database.findRemoveInsert(
            recentIntentions[i],
            collection
          );
        }
      }

      if (recentProjects && recentProjects.length > 0) {
        let collection = database.getCollection(
          JournalDatabase.Collections.PROJECTS
        );
        for (let i = 0; i < recentProjects.length; i++) {
          database.findRemoveInsert(
            recentProjects[i],
            collection
          );
        }
      }

      if (
        recentTasksByProjectId &&
        recentTasksByProjectId.length > 0
      ) {
        let collection = database.getCollection(
          JournalDatabase.Collections.TASKS
        );
        for (
          let i = 0;
          i < recentTasksByProjectId.length;
          i++
        ) {
          database.findRemoveInsert(
            recentTasksByProjectId[i],
            collection
          );
        }
      }
    }

    arg.data = store.data;
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
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
          args: { username: JournalController.Strings.ME }
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
        // FIXME this needs to be updated to use better functions
        // this.updateRecentTasksByProjectId(
        //   view,
        //   collection,
        //   summary
        // );
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
    console.log("XXX-handleGetRecentIntentionsEvent");

    // FIXME figure out why this isn't working for other users

    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      ),
      collection = database.getCollection(
        JournalDatabase.Collections.INTENTIONS
      ),
      username = arg.args.username,
      me = this.getMemberMe();

    if (!username) {
      arg.error = "Unknown user '" + username + "'";
    } else {
      if (username === BaseController.Strings.ME) {
        username = me.username;
      }
      arg.data = collection
        .chain()
        .find({ username: username })
        .simplesort(JournalDatabase.Indices.TIMESTAMP)
        .data();
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
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
