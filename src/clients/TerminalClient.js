import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our terminal service on gridtime
 */
export class TerminalClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for a Terminal in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[TerminalClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TERMINAL_CLIENT,
      this,
      null,
      this.onTerminalEventReply
    );
  }

  /**
   * general enum list of all of our possible terminal events
   * @returns {{RUN_COMMAND: string, GET_MANUAL_PAGE: string, GET_MANUAL: string, GET_MANUAL_HELP_TOPICS: string}}
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
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TerminalClient.instance) {
      TerminalClient.instance = new TerminalClient(scope);
    }
  }

  /**
   * Creates a new terminal session, and establishes a talk room
   * for all terminal activity
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static createSession(scope, callback) {
    let event = TerminalClient.instance.createClientEvent(
      TerminalClient.Events.CREATE_SESSION,
      {},
      scope,
      callback
    );
    TerminalClient.instance.notifyTerminal(event);
    return event;
  }


  /**
   * Runs a terminal command on gridtime
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static runCommand(circuitName, commandInput, scope, callback) {
    let event = TerminalClient.instance.createClientEvent(
      TerminalClient.Events.RUN_COMMAND,
      {
        circuitName: circuitName,
        commandInput: commandInput
      },
      scope,
      callback
    );
    TerminalClient.instance.notifyTerminal(event);
    return event;
  }

  /**
   * Retrieve the entire terminal command manual from gridtime
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getManual(scope, callback) {
    let event = TerminalClient.instance.createClientEvent(
      TerminalClient.Events.GET_MANUAL,
      {},
      scope,
      callback
    );
    TerminalClient.instance.notifyTerminal(event);
    return event;
  }


  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onTerminalEventReply = (event, arg) => {
    let clientEvent = TerminalClient.replies.get(arg.id);
    this.logReply(
      TerminalClient.name,
      TerminalClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      TerminalClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyTerminal(clientEvent) {
    console.log(
      "[" +
        TerminalClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    TerminalClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
