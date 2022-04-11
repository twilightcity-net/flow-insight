const Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  JournalDatabase = require("../database/JournalDatabase");

/**
 * This class is used to coordinate controllers across the journal service
 * @type {JournalController}
 */
module.exports = class JournalController extends (
  BaseController
) {
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
   * @returns {{GET_RECENT_INTENTIONS: string, LOAD_RECENT_JOURNAL: string, CREATE_INTENTION: string, GET_RECENT_TASKS: string, FINISH_INTENTION: string, UPDATE_FLAME_RATING: string, FIND_OR_CREATE_PROJECT: string, GET_RECENT_PROJECTS: string, FIND_OR_CREATE_TASK: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_RECENT_JOURNAL: "load-recent-journal",
      CREATE_INTENTION: "create-intention",
      FIND_OR_CREATE_TASK: "find-or-create-task",
      FIND_OR_CREATE_PROJECT: "find-or-create-project",
      GET_RECENT_INTENTIONS: "get-recent-intentions",
      GET_RECENT_PROJECTS: "get-recent-projects",
      GET_RECENT_TASKS: "get-recent-tasks",
      FINISH_INTENTION: "finish-intention",
      UPDATE_FLAME_RATING: "update-flame-rating",
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
    this.journalClientEventListener =
      EventFactory.createEvent(
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
        case JournalController.Events.FIND_OR_CREATE_TASK:
          this.handleFindOrCreateTaskEvent(event, arg);
          break;
        case JournalController.Events
          .FIND_OR_CREATE_PROJECT:
          this.handleFindOrCreateProjectEvent(event, arg);
          break;
        case JournalController.Events.GET_RECENT_INTENTIONS:
          this.handleGetRecentIntentionsEvent(event, arg);
          break;
        case JournalController.Events.GET_RECENT_PROJECTS:
          this.handleGetRecentProjectsEventWithFallback(event, arg);
          break;
        case JournalController.Events.GET_RECENT_TASKS:
          this.handleGetRecentTasksEventWithFallback(event, arg);
          break;
        case JournalController.Events.FINISH_INTENTION:
          this.handleFinishIntentionEvent(event, arg);
          break;
        case JournalController.Events.UPDATE_FLAME_RATING:
          this.handleUpdateFlameRatingEvent(event, arg);
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
   * In the case that we lost our network connection, and data in our local store may be
   * stale and out of date, reset our known user history so the journal gets reloaded
   * from the server on the next request
   */
  reset(callback) {
    JournalController.instance.userHistory = new Set();
    if (callback) {
      callback();
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
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.SEPARATOR +
        username;

    if (limit) {
      urn += JournalController.Params.LIMIT + limit;
    }

    this.doClientRequest(
      "JournalClient",
      {},
      "getRecentJournal",
      JournalController.Types.GET,
      urn,
      (store) =>
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
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.JOURNAL
        );

      database.updateJournalIntentions(
        data.recentIntentions
      );

      if (username === JournalController.Strings.ME ) {
        username = this.getMeUsername();
      }

      //only update recent projects and tasks for the logged in user
      if (
        username === JournalController.Strings.ME ||
        username === this.getMeUsername()
      ) {
        database.updateJournalProjects(data.recentProjects);
        database.updateJournalTasks(
          data.recentTasksByProjectId
        );
      }

      //only add to user history if the call was successful
      JournalController.instance.userHistory.add(username);
      arg.data = store.data;
    }

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
        JournalController.Paths.SEPARATOR +
        JournalController.Strings.ME +
        JournalController.Paths.INTENTION;

    this.doClientRequest(
      "JournalClient",
      {
        description: description,
        projectId: projectId,
        taskId: taskId,
      },
      "createIntention",
      JournalController.Types.POST,
      urn,
      (store) =>
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
    } else {
      let journalDatabase = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.JOURNAL
        ),
        intention = store.data;

      journalDatabase.updateIntention(intention);
      arg.data = intention;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles the find or create task events called from
   * the client side code of the shell
   * @param event
   * @param arg
   * @param callback
   */
  handleFindOrCreateTaskEvent(event, arg, callback) {
    let projectId = arg.args.projectId,
      name = arg.args.name,
      description = arg.args.description,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.PROJECT +
        JournalController.Paths.SEPARATOR +
        projectId +
        JournalController.Paths.TASK;

    this.doClientRequest(
      JournalController.Contexts.JOURNAL_CLIENT,
      {
        name: name,
        description: description,
      },
      JournalController.Names.FIND_OR_CREATE_TASK,
      JournalController.Types.POST,
      urn,
      (store) =>
        this.delegateFindOrCreateTaskCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * delegates how we process the callback for the
   * find or create task functions workflow. sounds fun
   * cuz it is.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateFindOrCreateTaskCallback(
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
        task = store.data;

      database.addNewTask(task);
      arg.data = task;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }
  }

  /**
   * handles client events that find or create new projects
   * @param event
   * @param arg
   * @param callback
   */
  handleFindOrCreateProjectEvent(event, arg, callback) {
    let name = arg.args.name,
      description = arg.args.description,
      isPrivate = arg.args.isPrivate,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.PROJECT;

    this.doClientRequest(
      JournalController.Contexts.JOURNAL_CLIENT,
      {
        name: name,
        description: description,
        isPrivate: isPrivate,
      },
      JournalController.Names.FIND_OR_CREATE_PROJECT,
      JournalController.Types.POST,
      urn,
      (store) =>
        this.delegateFindOrCreateProjectCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our callback for our handler that is called by our client.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateFindOrCreateProjectCallback(
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
        project = store.data;

      database.addNewProject(project);
      arg.data = project;
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
      collection = database.getCollection(
        JournalDatabase.Collections.INTENTIONS
      ),
      username = arg.args.username;

    let meUsername = this.getMeUsername();

    if (username === BaseController.Strings.ME && meUsername) {
      username = meUsername;
    }

    if (
      JournalController.instance.userHistory.has(username)
    ) {

      arg.data = collection
        .chain()
        .find({ username: username })
        .simplesort(JournalDatabase.Indices.TIMESTAMP)
        .data();

      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      this.handleLoadJournalEvent(
        {},
        {
          args: {
            username: username,
          },
        },
        (args) => {
          if (args.data) {
            arg.data = args.data.recentIntentions;
          }
          if (args.error) {
            arg.error = args.error;
          }

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
   * gets our recent projects for a user with fallback to querying the server
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentProjectsEventWithFallback(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      );

    let username = this.getMeUsername();

    if (JournalController.instance.userHistory.has(username)) {
      let view = database.getViewForProjects();

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
      this.handleLoadRecentProjectTasksEvent(
        {},
        {},
        (args) => {

          if (args.data) {
            arg.data = args.data.recentProjects;
          }
          if (args.error) {
            arg.error = args.error;
          }

          this.delegateCallbackOrEventReplyTo(
            event,
            arg,
            callback
          );
        }
      );
    }
  }

  handleLoadRecentProjectTasksEvent(event, arg, callback) {
    let urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.PROJECT;

    this.doClientRequest(
      JournalController.Contexts.JOURNAL_CLIENT,
      {},
      JournalController.Names.GET_RECENT_PROJECT_TASKS,
      JournalController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadRecentProjectTasksCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  delegateLoadRecentProjectTasksCallback(store, event, arg, callback) {
      if (store.error) {
        arg.error = store.error;
      } else {
        //dont update the DB for this, let the main intentions call update the DB
        arg.data = store.data;
      }

      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );

  }

  /**
   * gets our recent tasks for a user with a fallback query to the server
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRecentTasksEventWithFallback(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.JOURNAL
    );

    let username = this.getMeUsername();

    if (JournalController.instance.userHistory.has(username)) {
      let view = database.getViewForTasks();

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
      this.handleLoadRecentProjectTasksEvent(
        {},
        {},
        (args) => {

          if (args.data) {
            let tasks = [];

            for (let [p, t] of Object.entries(args.data.recentTasksByProjectId)) {
              for (let i = 0; i < t.length; i++) {
                tasks.push(t[i]);
              }
            }

            arg.data = tasks;
          }
          if (args.error) {
            arg.error = args.error;
          }

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
   * controller callback function that processes our finish intention action.
   * This function makes a call to gridtime, which updates the finishStatus to
   * done. Gridtime then will send an update message over talk to the client to
   * update the appropriate database collections and gui components.
   * @param event
   * @param arg
   * @param callback
   */
  handleFinishIntentionEvent(event, arg, callback) {
    let id = arg.args.id,
      finishStatus = arg.args.finishStatus,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.ME +
        JournalController.Paths.INTENTION +
        JournalController.Paths.SEPARATOR +
        id +
        JournalController.Paths.TRANSITION +
        JournalController.Paths.FINISH;

    this.doClientRequest(
      JournalController.Contexts.JOURNAL_CLIENT,
      {
        finishStatus: finishStatus,
      },
      JournalController.Names.FINISH_INTENTION,
      JournalController.Types.POST,
      urn,
      (store) =>
        this.delegateFinishIntentionCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * the delegate processor for the finish intention callback. This callback
   * function processor will update the database collection and return the arg
   * to the client's renderer processor.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateFinishIntentionCallback(
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
      );

      arg.data = store.data;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }
  }

  /**
   * event controller which handler the user setting an intentions flame rating.
   * The values should be an integer and range from -5 to 5.
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateFlameRatingEvent(event, arg, callback) {
    let intentionId = arg.args.intentionId,
      flameRating = arg.args.flameRating,
      urn =
        JournalController.Paths.JOURNAL +
        JournalController.Paths.ME +
        JournalController.Paths.INTENTION +
        JournalController.Paths.SEPARATOR +
        intentionId +
        JournalController.Paths.TRANSITION +
        JournalController.Paths.FLAME;

    this.doClientRequest(
      JournalController.Contexts.JOURNAL_CLIENT,
      {
        flameRating: flameRating,
      },
      JournalController.Names.UPDATE_FLAME_RATING,
      JournalController.Types.POST,
      urn,
      (store) =>
        this.delegateUpdateFlameRatingCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * process flame rating for the update flame callback. This updates the collections
   * and then returns some values to the client through the arv value that is injected
   * into the event bus life.  bus 4 lyfe!.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateUpdateFlameRatingCallback(
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
      );

      arg.data = store.data;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }
  }
};
