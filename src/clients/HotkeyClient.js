import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that gets and saves info related to hotkeys
 */
export class HotkeyClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for the Notifications in our local DB
   * @param scope
   */
  constructor(scope) {
    super(scope, "[NotificationClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.HOTKEY_CLIENT,
      this,
      null,
      this.onHotkeyEventReply
    );
  }

  /**
   * general enum list of all of our possible notification events
   * @returns {{GET_CONSOLE_SHORTCUT:string, UPDATE_SHORTCUTS:string, GET_CURRENT_SHORTCUTS:string, }}
   * @constructor
   */
  static get Events() {
    return {
      UPDATE_SHORTCUTS: "update-shortcuts",
      GET_CURRENT_SHORTCUTS: "get-current-shortcuts",
      GET_CONSOLE_SHORTCUT: "get-console-shortcut"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!HotkeyClient.instance) {
      HotkeyClient.instance = new HotkeyClient(
        scope
      );
    }
  }

  /**
   * gets all our current configurable shortcuts
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getCurrentShortcuts(scope, callback) {
    let event =
      HotkeyClient.instance.createClientEvent(
        HotkeyClient.Events.GET_CURRENT_SHORTCUTS,
        {},
        scope,
        callback
      );
    HotkeyClient.instance.notifyHotkey(event);
    return event;
  }


  /**
   * gets our current configurable console shortcut
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getConsoleShortcut(scope, callback) {
    console.log("hello!");
    let event =
      HotkeyClient.instance.createClientEvent(
        HotkeyClient.Events.GET_CONSOLE_SHORTCUT,
        {},
        scope,
        callback
      );
    HotkeyClient.instance.notifyHotkey(event);
    return event;
  }

  /**
   * Updates config changes to shortcuts
   * @param shortcuts
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static updateShortcuts(shortcuts, scope, callback) {
    let event =
      HotkeyClient.instance.createClientEvent(
        HotkeyClient.Events.UPDATE_SHORTCUTS,
        {shortcuts : shortcuts},
        scope,
        callback
      );
    HotkeyClient.instance.notifyHotkey(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onHotkeyEventReply = (event, arg) => {
    let clientEvent = HotkeyClient.replies.get(
      arg.id
    );
    this.logReply(
      HotkeyClient.name,
      HotkeyClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      HotkeyClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyHotkey(clientEvent) {
    console.log(
      "[" +
        HotkeyClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    HotkeyClient.replies.set(
      clientEvent.id,
      clientEvent
    );
    this.event.dispatch(clientEvent, true);
  }
}
