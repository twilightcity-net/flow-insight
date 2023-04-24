const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");

/**
 * This class is used to coordinate calls to gridtime for the Chart service
 * @type {ChartController}
 */
module.exports = class ChartController extends (
  BaseController
) {
  /**
   * builds our Chart Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, ChartController);
    if (!ChartController.instance) {
      ChartController.instance = this;
      ChartController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for chart requests
   * @constructor
   */
  static get Events() {
    return {
      CHART_WTF: "chart-wtf",
      CHART_DAY: "chart-day",
      CHART_TASK: "chart-task",
      CHART_TASK_FOR_USER: "chart-task-for-user",
      CHART_TASK_FOR_WTF: "chart-task-for-wtf",
      CHART_TOP_BOXES: "chart-top-boxes",
      CHART_TOP_FILES_FOR_BOX: "chart-top-files-for-box",
      CHART_TOP_BOXES_FOR_TEAM: "chart-top-boxes-for-team",
      CHART_TOP_BOXES_FOR_USER: "chart-top-boxes-for-user",
      CHART_TOP_FILES_FOR_BOX_FOR_TEAM:
        "chart-top-files-for-box-for-team",
      CHART_TOP_FILES_FOR_BOX_FOR_USER:
        "chart-top-files-for-box-for-user",
      CHART_TOP_MODULES: "chart-top-modules",
      CHART_TOP_MODULES_FOR_TEAM:
        "chart-top-modules-for-team",
      CHART_TOP_MODULES_FOR_USER:
        "chart-top-modules-for-user",
      CHART_TOP_TASKS: "chart-top-tasks",
      CHART_TOP_TASKS_FOR_TEAM: "chart-top-tasks-for-team",
      CHART_TOP_TASKS_FOR_USER: "chart-top-tasks-for-user",
      CHART_TOP_BOXES_FOR_MODULE:
        "chart-top-boxes-for-module",
      CHART_TOP_BOXES_FOR_MODULE_FOR_TEAM:
        "chart-top-boxes-for-module-for-team",
      CHART_TOP_BOXES_FOR_MODULE_FOR_USER:
        "chart-top-boxes-for-module-for-user",
      CHART_FAMILIARITY: "chart-familiarity",
      CHART_FAMILIARITY_FOR_USER:
        "chart-familiarity-for-user",
      CHART_FAMILIARITY_FOR_TEAM:
        "chart-familiarity-for-team",
      CHART_TOP_TAGS: "chart-top-tags",
      CHART_TOP_TAGS_FOR_USER: "chart-top-tags-for-user",
      CHART_TOP_TAGS_FOR_TEAM: "chart-top-tags-for-team",
      CHART_TOP_WTFS_WITH_TAG: "chart-top-wtfs-with-tag",
      CHART_TOP_WTFS_WITH_TAG_FOR_USER:
        "chart-top-wtfs-with-tag-for-user",
      CHART_TOP_WTFS_WITH_TAG_FOR_TEAM:
        "chart-top-wtfs-with-tag-for-team",
      CHART_FRICTION: "chart-friction",
      CHART_FRICTION_FOR_USER: "chart-friction-for-user",
      CHART_FRICTION_FOR_TEAM: "chart-friction-for-team",
      CHART_LATEST_WEEK: "chart-latest-week"
    };
  }

  /**
   * TimeScope options that need to be translated into gt expressions
   * @constructor
   */
  static get TimeScope() {
    return {
      ALL: "all",
      LATEST_TWO: "latest.two",
      LATEST_FOUR: "latest.four",
      LATEST_SIX: "latest.six",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      ChartController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(ChartController.instance);
    this.chartClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.CHART_CLIENT,
        this,
        this.onChartClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onChartClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        ChartController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case ChartController.Events.CHART_WTF:
          this.handleChartWTFEvent(event, arg);
          break;
        case ChartController.Events.CHART_DAY:
          this.handleChartDayEvent(event, arg);
          break;
        case ChartController.Events.CHART_TASK:
          this.handleChartTaskEvent(event, arg);
          break;
        case ChartController.Events.CHART_TASK_FOR_USER:
          this.handleChartTaskForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TASK_FOR_WTF:
          this.handleChartTaskForWtfEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES:
          this.handleChartTopBoxesEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_FILES_FOR_BOX:
          this.handleChartTopFilesForBoxEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES_FOR_TEAM:
          this.handleChartTopBoxesForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES_FOR_USER:
          this.handleChartTopBoxesForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_FILES_FOR_BOX_FOR_TEAM:
          this.handleChartTopFilesForBoxForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_FILES_FOR_BOX_FOR_USER:
          this.handleChartTopFilesForBoxForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_MODULES:
          this.handleChartTopModulesEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_MODULES_FOR_USER:
          this.handleChartTopModulesForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_MODULES_FOR_TEAM:
          this.handleChartTopModulesForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES_FOR_MODULE:
          this.handleChartTopBoxesForModuleEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES_FOR_MODULE_FOR_USER:
          this.handleChartTopBoxesForModuleForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_BOXES_FOR_MODULE_FOR_TEAM:
          this.handleChartTopBoxesForModuleForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_FAMILIARITY:
          this.handleChartFamiliarityEvent(event, arg);
          break;
        case ChartController.Events.CHART_FAMILIARITY_FOR_USER:
          this.handleChartFamiliarityForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_FAMILIARITY_FOR_TEAM:
          this.handleChartFamiliarityForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TAGS:
          this.handleChartTopTagsEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TAGS_FOR_USER:
          this.handleChartTopTagsForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TAGS_FOR_TEAM:
          this.handleChartTopTagsForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_WTFS_WITH_TAG:
          this.handleChartTopWtfsWithTagEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_WTFS_WITH_TAG_FOR_USER:
          this.handleChartTopWtfsWithTagForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_WTFS_WITH_TAG_FOR_TEAM:
          this.handleChartTopWtfsWithTagForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_FRICTION:
          this.handleChartFrictionEvent(event, arg);
          break;
        case ChartController.Events.CHART_FRICTION_FOR_USER:
          this.handleChartFrictionForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_FRICTION_FOR_TEAM:
          this.handleChartFrictionForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TASKS:
          this.handleChartTopTasksEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TASKS_FOR_USER:
          this.handleChartTopTasksForUserEvent(event, arg);
          break;
        case ChartController.Events.CHART_TOP_TASKS_FOR_TEAM:
          this.handleChartTopTasksForTeamEvent(event, arg);
          break;
        case ChartController.Events.CHART_LATEST_WEEK:
          this.handleChartLatestWeekEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown chart client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * client event handler for charting a task
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTaskEvent(event, arg, callback) {
    let projectName = arg.args.projectName,
      taskName = arg.args.taskName,
      bucket = arg.args.bucket,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.PROJECT +
        ChartController.Paths.SEPARATOR +
        projectName +
        ChartController.Paths.TASK +
        ChartController.Paths.SEPARATOR +
        taskName;

    if (bucket) {
      urn += "?bucket_size=" + bucket;
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TASK,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting a task for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTaskForUserEvent(event, arg, callback) {
    let projectName = arg.args.projectName,
      taskName = arg.args.taskName,
      username = arg.args.username,
      bucket = arg.args.bucket,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.PROJECT +
        ChartController.Paths.SEPARATOR +
        projectName +
        ChartController.Paths.TASK +
        ChartController.Paths.SEPARATOR +
        taskName;

    urn += "?target_type=USER&target_name=" + username;

    if (bucket) {
      urn += "&bucket_size=" + bucket;
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TASK,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting familiarity for default user (me)
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFamiliarityEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.FAMILIARITY;

    if (timeScope) {
      urn += this.convertToGtTimeScope("?", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FAMILIARITY,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting familiarity for specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFamiliarityForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.FAMILIARITY;

    urn += "?target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FAMILIARITY_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting familiarity for specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFamiliarityForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.FAMILIARITY;

    urn += "?target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FAMILIARITY_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tags
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTagsEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TAG;

    if (timeScope) {
      urn += this.convertToGtTimeScope("?", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TAGS,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tags for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTagsForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TAG;

    urn += "?target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TAGS_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tags for a specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTagsForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TAG;

    urn += "?target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TAGS_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top wtfs with a specific tag
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopWtfsWithTagEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      tagName = arg.args.tagName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.WTF_PATH +
      ChartController.Paths.TAG;

    urn += "?tag_name=" + tagName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_WTFS_WITH_TAG,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top wtfs with a specific tag for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopWtfsWithTagForUserEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      tagName = arg.args.tagName,
      username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.WTF_PATH +
      ChartController.Paths.TAG;

    urn += "?tag_name=" + tagName;

    urn += "&target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_WTFS_WITH_TAG_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top wtfs with a specific tag for a specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopWtfsWithTagForTeamEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      tagName = arg.args.tagName,
      teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.WTF_PATH +
      ChartController.Paths.TAG;

    urn += "?tag_name=" + tagName;

    urn += "&target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_WTFS_WITH_TAG_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tasks
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTasksEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TASK;

    if (timeScope) {
      urn += this.convertToGtTimeScope("?", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TASKS,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tasks for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTasksForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TASK;

    urn += "?target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TASKS_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top tasks for a specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopTasksForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.TASK;

    urn += "?target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_TASKS_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top modules
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopModulesEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.MODULE;

    if (timeScope) {
      urn += this.convertToGtTimeScope("?", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_MODULES,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top modules for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopModulesForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.MODULE;

    urn += "?target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_MODULES_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top modules for a specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopModulesForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.MODULE;

    urn += "?target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_MODULES_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes for a specific module
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesForModuleEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      moduleName = arg.args.moduleName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX +
      ChartController.Paths.IN +
      ChartController.Paths.MODULE;

    urn += "?module_name=" + moduleName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_BOXES_FOR_MODULE,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes for a specific module and user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesForModuleForUserEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      moduleName = arg.args.moduleName,
      username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX +
      ChartController.Paths.IN +
      ChartController.Paths.MODULE;

    urn += "?module_name=" + moduleName;

    urn += "&target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_BOXES_FOR_MODULE_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes for a specific module and user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesForModuleForTeamEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      moduleName = arg.args.moduleName,
      teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX +
      ChartController.Paths.IN +
      ChartController.Paths.MODULE;

    urn += "?module_name=" + moduleName;

    urn += "&target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_BOXES_FOR_MODULE_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX;

    if (timeScope) {
      urn += this.convertToGtTimeScope("?", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_BOXES,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top files for a box
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopFilesForBoxEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      project = arg.args.project,
      box = arg.args.box;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.FILE +
      ChartController.Paths.IN +
      ChartController.Paths.BOX;

    urn += "?box_path=" + project + "." + box;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_FILES_FOR_BOX,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  convertToGtTimeScope(joinChar, timeScope) {
    if (
      timeScope.startsWith("gt[") &&
      timeScope.length < 25
    ) {
      return joinChar + "gt_exp=" + timeScope;
    }
    if (timeScope === ChartController.TimeScope.ALL) {
      return joinChar + "gt_exp=gt[*]";
    } else if (
      timeScope === ChartController.TimeScope.LATEST_TWO
    ) {
      return joinChar + "scope=TWO";
    } else if (
      timeScope === ChartController.TimeScope.LATEST_FOUR
    ) {
      return joinChar + "scope=FOUR";
    } else if (
      timeScope === ChartController.TimeScope.LATEST_SIX
    ) {
      return joinChar + "scope=SIX";
    }
  }

  /**
   * client event handler for charting top files for a box for a team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopFilesForBoxForTeamEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      teamName = arg.args.teamName,
      project = arg.args.project,
      box = arg.args.box;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.FILE +
      ChartController.Paths.IN +
      ChartController.Paths.BOX;

    urn += "?box_path=" + project + "." + box;

    urn += "&target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_FILES_FOR_BOX_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top files for a box for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopFilesForBoxForUserEvent(
    event,
    arg,
    callback
  ) {
    let timeScope = arg.args.timeScope,
      username = arg.args.username,
      project = arg.args.project,
      box = arg.args.box;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.FILE +
      ChartController.Paths.IN +
      ChartController.Paths.BOX;

    urn += "?box_path=" + project + "." + box;

    urn += "&target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names
        .CHART_TOP_FILES_FOR_BOX_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes for specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let username = arg.args.username;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX;

    urn += "?target_type=USER&target_name=" + username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_BOXES_FOR_USER,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting top boxes for team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopBoxesForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope;
    let teamName = arg.args.teamName;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.BOX;

    urn += "?target_type=TEAM&target_name=" + teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_BOXES_FOR_TEAM,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting latest friction for the current week
   * @param event
   * @param arg
   * @param callback
   */
  handleChartLatestWeekEvent(event, arg, callback) {
    let timezoneOffset = arg.args.timezoneOffset,
      weekOffset = arg.args.weekOffset,
        urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.LATEST;

    urn += "?timezone_offset=" +timezoneOffset;
    urn += "&week_offset=" + weekOffset;

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_LATEST_WEEK,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for charting friction for a period of time
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFrictionEvent(event, arg, callback) {
    let bucket = arg.args.bucket,
      timeScope = arg.args.timeScope,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION;

    urn += "?bucket_size=" + bucket;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FRICTION,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting friction for a period of time, for a specific user
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFrictionForUserEvent(event, arg, callback) {
    let bucket = arg.args.bucket,
      username = arg.args.username,
      timeScope = arg.args.timeScope,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION;

    urn += "?target_type=USER&target_name=" + username;

    urn += "&bucket_size=" + bucket;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FRICTION,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting friction for a period of time, for a specific team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartFrictionForTeamEvent(event, arg, callback) {
    let bucket = arg.args.bucket,
      teamName = arg.args.teamName,
      timeScope = arg.args.timeScope,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION;

    urn += "?target_type=TEAM&target_name=" + teamName;
    urn += "&bucket_size=" + bucket;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_FRICTION,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for charting a single day
   * @param event
   * @param arg
   * @param callback
   */
  handleChartDayEvent(event, arg, callback) {
    let gtCoords = arg.args.gtCoords,
      timezoneOffset = arg.args.timezoneOffset,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.DAY;

    urn += "?gt_exp=" + gtCoords;

    urn += "&timezone_offset=" +timezoneOffset;

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_DAY,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting a wtf
   * @param event
   * @param arg
   * @param callback
   */
  handleChartWTFEvent(event, arg, callback) {
    let circuitPath = arg.args.circuitPath,
      bucket = arg.args.bucket,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.WTF_PATH;

    urn +=
      "?circuit_path=" +
      circuitPath +
      "&bucket_size=" +
      bucket;

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_WTF,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for charting a task for a wtf
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTaskForWtfEvent(event, arg, callback) {
    let circuitPath = arg.args.circuitPath,
      bucket = arg.args.bucket,
      urn =
        ChartController.Paths.CHART +
        ChartController.Paths.FRICTION +
        ChartController.Paths.WTF_PATH +
        ChartController.Paths.TASK;

    urn += "?circuit_path=" + circuitPath;

    if (bucket) {
      urn += "&bucket_size=" + bucket;
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TASK_FOR_WTF,
      ChartController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegatorCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * Default delegator that just sets the state and callsback with no database actions
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  defaultDelegatorCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
