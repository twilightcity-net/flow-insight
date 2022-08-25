const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the Code service
 * @type {CodeController}
 */
module.exports = class CodeController extends (
  BaseController
) {

  /**
   * builds our Code Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, CodeController);
    if (!CodeController.instance) {
      CodeController.instance = this;
      CodeController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for code
   * @constructor
   */
  static get Events() {
    return {
      GET_CODE_MODULE_CONFIG: "get-code-module-config",
      UPDATE_CODE_MODULE_CONFIG: "update-code-module-config",
      GET_ALL_CODE_MODULE_CONFIGS: "get-all-code-module-configs"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      CodeController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CodeController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.CODE_CLIENT,
        this,
        this.onCodeClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onCodeClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        CodeController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case CodeController.Events.GET_CODE_MODULE_CONFIG:
          this.handleGetCodeModuleConfigEvent(event, arg);
          break;
        case CodeController.Events.UPDATE_CODE_MODULE_CONFIG:
          this.handleUpdateCodeModuleConfigEvent(event, arg);
          break;
        case CodeController.Events.GET_ALL_CODE_MODULE_CONFIGS:
          this.handleGetAllCodeModuleConfigsEvent(event, arg);
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
   * client event handler for retrieval of all code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllCodeModuleConfigsEvent(event, arg, callback) {
    let urn =
        CodeController.Paths.CODE;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      {},
      CodeController.Names.GET_ALL_CODE_MODULE_CONFIGS,
      CodeController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for retrieval of code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCodeModuleConfigEvent(event, arg, callback) {
    let moduleName = arg.args.moduleName,
      urn =
        CodeController.Paths.CODE +
        CodeController.Paths.SEPARATOR +
        moduleName;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      {},
      CodeController.Names.GET_CODE_MODULE_CONFIG,
      CodeController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for updating our code module details
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateCodeModuleConfigEvent(event, arg, callback) {
    let moduleName = arg.args.moduleName,
      configurations = arg.args.configurations,
      urn =
        CodeController.Paths.CODE +
        CodeController.Paths.SEPARATOR +
        moduleName;

    this.doClientRequest(
      CodeController.Contexts.CODE_CLIENT,
      configurations,
      CodeController.Names.UPDATE_CODE_MODULE_CONFIG,
      CodeController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
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
