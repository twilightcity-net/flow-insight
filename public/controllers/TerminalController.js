const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  Util = require("../Util.js");

/**
 * This class is used to coordinate controllers across the terminal service
 * @type {TerminalController}
 */
module.exports = class TerminalController extends (
  BaseController
) {
  /**
   * builds our Terminal Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TerminalController);
    if (!TerminalController.instance) {
      TerminalController.instance = this;
      TerminalController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible terminal events
   * @returns {{CREATE_SESSION: string, RUN_COMMAND: string, GET_MANUAL: string, }}
   * @constructor
   */
  static get Events() {
    return {
      CREATE_SESSION: "create-session",
      RUN_COMMAND: "run-command",
      GET_MANUAL: "get-manual",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      TerminalController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      TerminalController.instance
    );
    this.terminalClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.TERMINAL_CLIENT,
        this,
        this.onTerminalClientEvent,
        null
      );
  }

  /**
   * notified when we get a terminal event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTerminalClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        TerminalController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case TerminalController.Events.CREATE_SESSION:
          this.handleCreateSessionEvent(event, arg);
          break;
        case TerminalController.Events.RUN_COMMAND:
          this.handleRunCommandEvent(event, arg);
          break;
        case TerminalController.Events.GET_MANUAL:
          this.handleGetManualEvent(event, arg);
          break;
        default:
          throw new Error(
            TerminalController.Error.UNKNOWN +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }


  /**
   * Create a new terminal session on gridtime,
   * establishing a new talk channel for all terminal activity
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateSessionEvent(event, arg, callback) {
    let urn =
      TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT;

    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {},
      TerminalController.Names.CREATE_TERMINAL_SESSION,
      TerminalController.Types.POST,
      urn,
      (store) =>
        this.delegateCreateSessionCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * run terminal commands on gridtime server
   * @param event
   * @param arg
   * @param callback
   */

  handleRunCommandEvent(event, arg, callback) {
    let circuitName = arg.args.circuitName,
      cmdInput = arg.args.commandInput;

    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT +
      TerminalController.Paths.SEPARATOR +
      circuitName +
      TerminalController.Paths.RUN;


    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      cmdInput,
      TerminalController.Names.RUN_TERMINAL_COMMAND,
      TerminalController.Types.POST,
      urn,
      (store) =>
        this.delegateRunCommandCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateCreateSessionCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
      arg.data.url = Util.getAppApi();
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateRunCommandCallback(store, event, arg, callback) {
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
   * Retrieves the entire terminal manual from the gridtime server
   * @param event
   * @param arg
   * @param callback
   */
  handleGetManualEvent(event, arg, callback) {
    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.MANUAL;

    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {},
      TerminalController.Names.GET_TERMINAL_COMMAND_MANUAL,
      TerminalController.Types.GET,
      urn,
      (store) =>
        this.delegateGetManualCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateGetManualCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;

      //could store this is a db table?
      //dont really need to call this one everytime...
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

};
