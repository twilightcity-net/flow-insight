import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to converse with gridtime about code modules
 */
export class CodeClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for code module requests in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[CodeClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.CODE_CLIENT,
      this,
      null,
      this.onCodeEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
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
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!CodeClient.instance) {
      CodeClient.instance = new CodeClient(scope);
    }
  }

  /**
   * Retrieve code module configuration details
   * @param moduleName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getCodeModuleConfig(
    moduleName,
    scope,
    callback
  ) {
    let event = CodeClient.instance.createClientEvent(
      CodeClient.Events.GET_CODE_MODULE_CONFIG,
      {
        moduleName: moduleName
      },
      scope,
      callback
    );

    CodeClient.instance.notifyCode(event);
    return event;
  }

  /**
   * Retrieve all code module configuration details for all modules
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getAllCodeModuleConfigs(
    scope,
    callback
  ) {
    let event = CodeClient.instance.createClientEvent(
      CodeClient.Events.GET_ALL_CODE_MODULE_CONFIGS,
      {},
      scope,
      callback
    );

    CodeClient.instance.notifyCode(event);
    return event;
  }


  /**
   * Update code module configuration details, usually from a config file
   * loaded in the project directory
   * @param moduleName,
   * @param configurations
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static updateCodeModuleConfig(
    moduleName,
    configurations,
    scope,
    callback
  ) {
    let event = CodeClient.instance.createClientEvent(
      CodeClient.Events.UPDATE_CODE_MODULE_CONFIG,
      {
        moduleName: moduleName,
        configurations: configurations
      },
      scope,
      callback
    );

    CodeClient.instance.notifyCode(event);
    return event;
  }



  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onCodeEventReply = (event, arg) => {
    let clientEvent = CodeClient.replies.get(arg.id);
    this.logReply(
      CodeClient.name,
      CodeClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      CodeClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process code that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyCode(clientEvent) {
    console.log(
      "[" +
        CodeClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    CodeClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
