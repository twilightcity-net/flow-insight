const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");

/**
 * This class is used to coordinate controllers across the terminal service
 * @type {TerminalController}
 */
module.exports = class TerminalController extends BaseController {

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
   * @returns {{RUN_COMMAND: string, GET_MANUAL_PAGE: string, GET_MANUAL: string, GET_MANUAL_HELP_TOPICS: string}}
   * @constructor
   */
  static get Events() {
    return {
      RUN_COMMAND: "run-command",
      GET_MANUAL_PAGE: "get-manual-page",
      GET_MANUAL: "get-manual",
      GET_MANUAL_HELP_TOPICS: "get-manual-help-topics"
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
    BaseController.configEvents(TerminalController.instance);
    this.terminalClientEventListener = EventFactory.createEvent(
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
        case TerminalController.Events.RUN_COMMAND:
          this.handleRunCommandEvent(event, arg);
          break;
        case TerminalController.Events.GET_MANUAL_PAGE:
          this.handleGetManualPageEvent(event, arg);
          break;
        case TerminalController.Events.GET_MANUAL:
          this.handleGetManualEvent(event, arg);
          break;
        case TerminalController.Events.GET_MANUAL_HELP_TOPICS:
          this.handleGetManualHelpTopicsEvent(event, arg);
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
   * run terminal commands on gridtime server
   * @param event
   * @param arg
   * @param callback
   */

  handleRunCommandEvent(event, arg, callback) {
    let urn = TerminalController.Paths.TEAM;

    this.doClientRequest(
      TerminalController.Contexts.TEAM_CLIENT,
      {},
      TerminalController.Names.GET_ALL_MY_TEAMS,
      TerminalController.Types.GET,
      urn,
      store =>
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
  delegateRunCommandCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let result = store.data;

      if (result) {
        //do magic things
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Retrieves a specific terminal manual page from the gridtime server
   * @param event
   * @param arg
   * @param callback
   */
  handleGetManualPageEvent(event, arg, callback) {
    let urn = TerminalController.Paths.TEAM;

    this.doClientRequest(
      TerminalController.Contexts.TEAM_CLIENT,
      {},
      TerminalController.Names.GET_ALL_MY_TEAMS,
      TerminalController.Types.GET,
      urn,
      store =>
        this.delegateGetManualPageCallback(
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
  delegateGetManualPageCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let result = store.data;

      if (result) {
        //do magic things
      }
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
    let urn = TerminalController.Paths.TEAM;

    this.doClientRequest(
      TerminalController.Contexts.TEAM_CLIENT,
      {},
      TerminalController.Names.GET_ALL_MY_TEAMS,
      TerminalController.Types.GET,
      urn,
      store =>
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
  delegateGetManualCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let result = store.data;

      if (result) {
        //do magic things
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Retrieves all the available terminal help topics from the gridtime server
   * @param event
   * @param arg
   * @param callback
   */
  handleGetManualHelpTopicsEvent(event, arg, callback) {
    let urn = TerminalController.Paths.TEAM;

    this.doClientRequest(
      TerminalController.Contexts.TEAM_CLIENT,
      {},
      TerminalController.Names.GET_ALL_MY_TEAMS,
      TerminalController.Types.GET,
      urn,
      store =>
        this.delegateGetManualHelpTopicsCallback(
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
  delegateGetManualHelpTopicsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let result = store.data;

      if (result) {
        //do magic things
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

};
