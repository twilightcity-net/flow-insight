const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the Flow service and local Flow DB
 * @type {FlowController}
 */
module.exports = class FlowController extends (
  BaseController
) {
  /**
   * builds our Flow Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FlowController);
    if (!FlowController.instance) {
      FlowController.instance = this;
      FlowController.wireTogetherControllers();
    }


  }

  /**
   * general enum list of all of our possible circuit events for flow
   * @constructor
   */
  static get Events() {
    return {
      GET_MY_FLOW: "get-my-flow"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      FlowController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(FlowController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.FLOW_CLIENT,
        this,
        this.onFlowClientEvent,
        null
      );

    this.flowStateRefreshNotifier = EventFactory.createEvent(
      EventFactory.Types.FLOWSTATE_DATA_REFRESH,
      this
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onFlowClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        FlowController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FlowController.Events.GET_MY_FLOW:
          this.handleGetMyFlowEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown fervie client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * Update flow data in the DB
   * @param flowData
   */
  updateMyFlow(flowData) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.FLOW
    );
    database.updateMyFlow(flowData);

    this.flowStateRefreshNotifier.dispatch({});
  }

  /**
   * client event handler for retrieving flow data from the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyFlowEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.FLOW
    );

    arg.data = database.getMyFlow();

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
  defaultDelegateCallback(store, event, arg, callback) {
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
