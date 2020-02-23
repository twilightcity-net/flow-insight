import { RendererEvent } from "./RendererEventManager";

/**
 * This class is used as a helper class to store event names from
 * ./public/EventManager. When adding a new event make sure to update
 * the other file if you wish to listen to the events
 */
export class RendererEventFactory {
  /**
   * creates te event from the factory to use
   * @param type
   * @param args
   * @returns {RendererEvent}
   */
  static createEvent(type, ...args) {
    return new RendererEvent(type, ...args);
  }

  /**
   * static enum subclass to store event names
   * @returns {{SCREENSHOT_READY_FOR_DISPLAY: string, TALK_CONNECT_FAILED: string, READY_FOR_SCREENSHOT: string, CIRCUIT_CLIENT: string, APP_HEARTBEAT: string, TALK_CONNECTED: string, TALK_JOIN_ROOM: string, APPACTIVATOR_ACTIVATION_SAVED: string, APP_QUIT: string, APPACTIVATOR_SAVE_ACTIVATION: string, PREPARE_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN_FAILED: string, VIEW_CONSOLE_SIDEBAR_PANEL: string, WINDOW_CONSOLE_SHOW_HIDE: string, TALK_MESSAGE_ROOM: string, WINDOW_CONSOLE_SHOWN: string, TALK_MESSAGE_CLIENT: string, VIEW_CONSOLE_CIRCUITS_PANEL: string, DATASTORE_LOAD: string, VIEW_CONSOLE_SPIRIT_PANEL: string, DATASTORE_LOADED: string, APPLOADER_LOAD: string, TALK_LEAVE_ROOM: string, WINDOW_CONSOLE_BROWSER_LOAD: string, SCREENSHOT_COMPLETE: string, WINDOW_ACTIVATOR_CLOSE: string, APP_LOADED: string, SUBMIT_BUG_REPORT: string}}
   * @constructor
   */
  static get Events() {
    let prefix = "ipc-";
    return {
      APP_QUIT: prefix + "app-quit",
      APP_HEARTBEAT: prefix + "app-heartbeat",
      APP_PULSE: prefix + "app-pulse",
      APPLOADER_LOAD: prefix + "apploader-load",
      APP_LOADED: prefix + "app-loaded",
      WINDOW_LOADING_LOGIN_FAILED: prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_SHOWN: prefix + "window-console-shown",
      WINDOW_CONSOLE_SHOW_HIDE: prefix + "window-console-show-hide",
      WINDOW_ACTIVATOR_CLOSE: prefix + "window-activator-close",
      WINDOW_CONSOLE_BROWSER_REQUEST: prefix + "window-console-browser-request",
      WINDOW_CONSOLE_BROWSER_LOAD: prefix + "window-console-browser-load",
      TALK_CONNECTED: prefix + "talk-connected",
      TALK_CONNECT_FAILED: prefix + "talk-connect-failed",
      TALK_MESSAGE_CLIENT: prefix + "talk-message-client",
      TALK_MESSAGE_ROOM: prefix + "talk-message-room",
      TALK_JOIN_ROOM: prefix + "talk-join-room",
      TALK_LEAVE_ROOM: prefix + "talk-leave-room",
      JOURNAL_CLIENT: prefix + "journal-client",
      CIRCUIT_CLIENT: prefix + "circuit-client",
      VIEW_CONSOLE_SIDEBAR_PANEL: prefix + "view-console-sidebar-panel",
      VIEW_CONSOLE_TEAM_PANEL: prefix + "view-console-team-panel",
      VIEW_CONSOLE_SPIRIT_PANEL: prefix + "view-console-spirit-panel",
      VIEW_CONSOLE_CIRCUITS_PANEL: prefix + "view-console-circuits-panel",
      VIEW_CONSOLE_NOTIFICATIONS_PANEL:
        prefix + "view-console-notifications-panel",
      VIEW_CONSOLE_CIRCUIT_START_STOP: "view-console-circuit-start-stop",
      SUBMIT_BUG_REPORT: prefix + "bugreport-submitted",
      APPACTIVATOR_SAVE_ACTIVATION: prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED: prefix + "appactivator-activation-saved",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      PREPARE_FOR_SCREENSHOT: prefix + "prepare-for-screenshot",
      READY_FOR_SCREENSHOT: prefix + "ready-for-screenshot",
      SCREENSHOT_COMPLETE: prefix + "screenshot-complete",
      SCREENSHOT_READY_FOR_DISPLAY: prefix + "screenshot-ready-for-display",
      SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW:
        prefix + "shortcuts-window-console-sidebar-show"
    };
  }
}
