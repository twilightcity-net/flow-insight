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
   * @returns {{CHART_TOP_BOXES_FOR_TEAM: string, CHART_TOP_FILES_FOR_BOX_FOR_TEAM: string, CHART_WTF: string, CHART_TASK: string, CHART_TOP_FILES_FOR_BOX: string, CHART_TASK_FOR_WTF: string, CHART_TOP_BOXES: string}}
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
      CHART_TOP_FILES_FOR_BOX_FOR_TEAM: "chart-top-files-for-box-for-team"
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
        case ChartController.Events.CHART_TOP_FILES_FOR_BOX_FOR_TEAM:
          this.handleChartTopFilesForBoxForTeamEvent(event, arg);
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
        this.delegateChartTaskCallback(
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
        this.delegateChartTopBoxesCallback(
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
        this.delegateChartTopFilesInBoxCallback(
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
        this.delegateChartTopFilesInBoxForTeamCallback(
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
        this.delegateChartTopBoxesForTeamCallback(
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
        this.delegateChartWTFCallback(
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
        this.delegateChartTaskForWtfCallback(
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
  delegateChartTaskForWtfCallback(
    store,
    event,
    arg,
    callback
  ) {
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

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartTaskCallback(store, event, arg, callback) {
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

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartTopFilesInBoxCallback(store, event, arg, callback) {
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

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartTopFilesInBoxForTeamCallback(store, event, arg, callback) {
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

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartTopBoxesCallback(store, event, arg, callback) {
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

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartTopBoxesForTeamCallback(store, event, arg, callback) {
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

    /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartWTFCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      //we should push these to a chart DB, but for now, lets just go to the server each time.
      //it's possible that when we make the call, the tiles arent generated, and later on,
      //the tiles show up, making the same call return different results.

      //maybe we should put the last cursor position in the chart response, so that if we are missing
      //data, and we don't want to cache these results it should be easier to tell?
      //also the flames could be updated, and the tiles end up dirty... there's other reasons the tiles
      //could grow stale and our local cache become invalid.  The top files/exec data shouldnt change tho.

      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
