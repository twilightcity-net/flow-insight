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
   * @returns {{CREATE_CIRCUIT: string, RUN_COMMAND: string, GET_MANUAL: string, }}
   * @constructor
   */
  static get Events() {
    return {
      CREATE_CIRCUIT: "create-circuit",
      RUN_COMMAND: "run-command",
      GET_MANUAL: "get-manual",
      GET_TTYS: "get-ttys",
      JOIN_CIRCUIT: "join-circuit",
      LEAVE_CIRCUIT: "leave-circuit",
      SET_VARIABLE: "set-variable"
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
        case TerminalController.Events.CREATE_CIRCUIT:
          this.handleCreateSessionEvent(event, arg);
          break;
        case TerminalController.Events.RUN_COMMAND:
          this.handleRunCommandEvent(event, arg);
          break;
        case TerminalController.Events.GET_MANUAL:
          this.handleGetManualEvent(event, arg);
          break;
        case TerminalController.Events.GET_TTYS:
          this.handleGetTtysEvent(event, arg);
          break;
        case TerminalController.Events.JOIN_CIRCUIT:
          this.handleJoinCircuitEvent(event, arg);
          break;
        case TerminalController.Events.LEAVE_CIRCUIT:
          this.handleLeaveCircuitEvent(event, arg);
          break;
        case TerminalController.Events.SET_VARIABLE:
          this.handleSetVariableEvent(event, arg);
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
   * join terminal circuits on the network
   * @param event
   * @param arg
   * @param callback
   */

  handleJoinCircuitEvent(event, arg, callback) {
    let circuitName = arg.args.circuitName;

    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT +
      TerminalController.Paths.SEPARATOR +
      circuitName +
      TerminalController.Paths.JOIN;


    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {},
      TerminalController.Names.JOIN_TERMINAL_CIRCUIT,
      TerminalController.Types.POST,
      urn,
      (store) =>
        this.delegateJoinCircuitCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * leave terminal circuits on the network
   * @param event
   * @param arg
   * @param callback
   */

  handleLeaveCircuitEvent(event, arg, callback) {
    let circuitName = arg.args.circuitName;

    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT +
      TerminalController.Paths.SEPARATOR +
      circuitName +
      TerminalController.Paths.LEAVE;


    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {},
      TerminalController.Names.LEAVE_TERMINAL_CIRCUIT,
      TerminalController.Types.POST,
      urn,
      (store) =>
        this.delegateLeaveCircuitCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }



  /**
   * set environment variable in the context of a terminal circuit
   * @param event
   * @param arg
   * @param callback
   */

  handleSetVariableEvent(event, arg, callback) {
    let circuitName = arg.args.circuitName;

    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT +
      TerminalController.Paths.SEPARATOR +
      circuitName +
      TerminalController.Paths.SET;


    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {
        variableName: arg.args.variableName,
        value: arg.args.value
      },
      TerminalController.Names.SET_TERMINAL_ENVIRONMENT_VARIABLE,
      TerminalController.Types.POST,
      urn,
      (store) =>
        this.delegateSetVariableCallback(
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
  delegateSetVariableCallback(store, event, arg, callback) {
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
  delegateLeaveCircuitCallback(store, event, arg, callback) {
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
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateJoinCircuitCallback(store, event, arg, callback) {
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
  handleGetTtysEvent(event, arg, callback) {
    let urn = TerminalController.Paths.TERMINAL +
      TerminalController.Paths.CIRCUIT;

    this.doClientRequest(
      TerminalController.Contexts.TERMINAL_CLIENT,
      {},
      TerminalController.Names.GET_TERMINAL_TTYS,
      TerminalController.Types.GET,
      urn,
      (store) =>
        this.delegateGetTtysCallback(
          store,
          event,
          arg,
          callback
        )
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
  delegateGetTtysCallback(store, event, arg, callback) {
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
