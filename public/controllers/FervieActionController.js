const log = require("electron-log"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");

/**
 * This class is used to retrieve fervie action extensions configured from the IDE
 * @type {FervieActionController}
 */
module.exports = class FervieActionController extends (BaseController) {

  /**
   * builds our fervie action controller class from our base class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FervieActionController);
    if (!FervieActionController.instance) {
      FervieActionController.instance = this;
      FervieActionController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for fervie actions
   * @constructor
   */
  static get Events() {
    return {
      GET_ALL_FERVIE_ACTIONS: "get-all-fervie-actions",
      RUN_FERVIE_ACTION: "run-fervie-action",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      FervieActionController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(FervieActionController.instance);
    this.codeClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.FERVIE_ACTION_CLIENT,
        this,
        this.onFervieActionClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onFervieActionClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        FervieActionController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FervieActionController.Events.GET_ALL_FERVIE_ACTIONS:
          this.handleGetAllFervieActionsEvent(event, arg);
          break;
        case FervieActionController.Events.RUN_FERVIE_ACTION:
          this.handleRunFervieActionEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown code client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * client event handler for retrieval of all fervie actions
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllFervieActionsEvent(event, arg, callback) {
    arg.data = global.App.FervieActionConfigHandler.getAllFervieActions();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * client event handler for running a fervie action within the IDE
   * @param event
   * @param arg
   * @param callback
   */
  handleRunFervieActionEvent(event, arg, callback) {
    let actionId = arg.args.actionId;
    log.debug("[FervieActionController] handleRunFervieActionEvent = Action id = "+actionId);

    let fervieAction = global.App.FervieActionConfigHandler.getFervieActionForActionId(actionId);
    if (fervieAction) {
      log.debug("[FervieActionController] Running action in IDE, action = "+fervieAction.actionId);
      global.App.FervieActionRunner.runAction(fervieAction.pluginId, fervieAction.extensionName, fervieAction.actionId);
    } else {
      log.warn("[FervieActionController] Action not found for actionId = "+actionId)
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

};
