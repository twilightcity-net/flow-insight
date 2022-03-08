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
   * @returns {{CHART_TOP_BOXES_FOR_TEAM: string, CHART_TOP_FILES_FOR_BOX_FOR_USER:string, CHART_TOP_BOXES_FOR_USER:string, CHART_TOP_FILES_FOR_BOX_FOR_TEAM: string, CHART_WTF: string, CHART_TASK: string, CHART_TOP_FILES_FOR_BOX: string, CHART_TASK_FOR_WTF: string, CHART_TOP_BOXES: string}}
   * @constructor
   */
  static get Events() {
    return {
      CHART_WTF: "chart-wtf",
      CHART_TASK: "chart-task",
      CHART_TASK_FOR_WTF: "chart-task-for-wtf",
      CHART_TOP_BOXES: "chart-top-boxes",
      CHART_TOP_FILES_FOR_BOX: "chart-top-files-for-box",
      CHART_TOP_BOXES_FOR_TEAM: "chart-top-boxes-for-team",
      CHART_TOP_BOXES_FOR_USER: "chart-top-boxes-for-user",
      CHART_TOP_FILES_FOR_BOX_FOR_TEAM: "chart-top-files-for-box-for-team",
      CHART_TOP_FILES_FOR_BOX_FOR_USER: "chart-top-files-for-box-for-user"
    };
  }

  /**
   * TimeScope options that need to be translated into gt expressions
   * @returns {{ALL: string, LATEST_TWO: string, LATEST_FOUR: string, LATEST_SIX: string}}
   * @constructor
   */
  static get TimeScope() {
    return {
      ALL: "all",
      LATEST_TWO: "latest.two",
      LATEST_FOUR: "latest.four",
      LATEST_SIX: "latest.six"
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
        case ChartController.Events.CHART_TASK:
          this.handleChartTaskEvent(event, arg);
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
        ChartController.Paths.BOX ;

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
      ChartController.Paths.BOX ;

    urn += "?box_path="+project + "." + box;

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
    if (timeScope === ChartController.TimeScope.ALL) {
      return joinChar + "gt_exp=gt[*]";
    } else if (timeScope === ChartController.TimeScope.LATEST_TWO) {
      return joinChar + "scope=TWO";
    } else if (timeScope === ChartController.TimeScope.LATEST_FOUR) {
      return joinChar + "scope=FOUR";
    } else if (timeScope === ChartController.TimeScope.LATEST_SIX) {
      return joinChar + "scope=SIX";
    }
  }

  /**
   * client event handler for charting top files for a box for a team
   * @param event
   * @param arg
   * @param callback
   */
  handleChartTopFilesForBoxForTeamEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      teamName = arg.args.teamName,
      project = arg.args.project,
      box = arg.args.box;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.FILE +
      ChartController.Paths.IN +
      ChartController.Paths.BOX ;

    urn += "?box_path="+project + "." + box;

    urn += "&target_type=TEAM&target_name="+teamName;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_FILES_FOR_BOX_FOR_TEAM,
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
  handleChartTopFilesForBoxForUserEvent(event, arg, callback) {
    let timeScope = arg.args.timeScope,
      username = arg.args.username,
      project = arg.args.project,
      box = arg.args.box;

    let urn =
      ChartController.Paths.QUERY +
      ChartController.Paths.TOP +
      ChartController.Paths.FILE +
      ChartController.Paths.IN +
      ChartController.Paths.BOX ;

    urn += "?box_path="+project + "." + box;

    urn += "&target_type=USER&target_name="+username;

    if (timeScope) {
      urn += this.convertToGtTimeScope("&", timeScope);
    }

    this.doClientRequest(
      ChartController.Contexts.CHART_CLIENT,
      {},
      ChartController.Names.CHART_TOP_FILES_FOR_BOX_FOR_USER,
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
      ChartController.Paths.BOX ;

    urn += "?target_type=USER&target_name="+username;

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
      ChartController.Paths.BOX ;

    urn += "?target_type=TEAM&target_name="+teamName;

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
