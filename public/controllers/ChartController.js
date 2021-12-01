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
   * @returns {{CHART_WTF: string}}
   * @constructor
   */
  static get Events() {
    return {
      CHART_WTF: "chart-wtf",
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

    urn += "?circuit_path="+ circuitPath + "&bucket_size="+bucket;

    //the circuit path, and bucket are query params... so I need to actually append them to the path,
    //and then pass in blank {}?  Should look at another GET query... yeah looks like thats how it works


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
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateChartWTFCallback(
    store,
    event,
    arg,
    callback
  ) {
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
