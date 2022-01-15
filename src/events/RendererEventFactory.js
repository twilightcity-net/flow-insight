import { RendererEvent } from "./RendererEventManager";

/**
 * This class is used as a helper class to store event names from
 * ./public/EventManager. When adding a new event make sure to update
 * the other file if you wish to listen to the events.
 */
export class RendererEventFactory {
  /**
   * creates te event from the factory to use
   * @param type
   * @param scope
   * @param callback
   * @param reply
   * @returns {RendererEvent}
   */
  static createEvent(type, scope, callback, reply) {
    return new RendererEvent(type, scope, callback, reply);
  }

  /**
   * static enum subclass to store event names.
   * @returns {{VIEW_CONSOLE_NOTIFICATIONS_PANEL: string, SCREENSHOT_READY_FOR_DISPLAY: string, VIEW_CONSOLE_CIRCUIT_SOLVE: string, TALK_CONNECT_FAILED: string, READY_FOR_SCREENSHOT: string, CIRCUIT_CLIENT: string, JOURNAL_CLIENT: string, APP_HEARTBEAT: string, TALK_CONNECTED: string, TALK_JOIN_ROOM: string, APPACTIVATOR_ACTIVATION_SAVED: string, APP_QUIT: string, APPACTIVATOR_SAVE_ACTIVATION: string, VIEW_CONSOLE_JOIN_EXISTING_ROOM: string, TEAM_CIRCUIT_CLIENT: string, PREPARE_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN_FAILED: string, VIEW_CONSOLE_SIDEBAR_PANEL: string, VIEW_CONSOLE_CIRCUIT_PAUSE_RESUME: string, VIEW_CONSOLE_CIRCUIT_JOIN_LEAVE: string, WINDOW_CONSOLE_SHOW_HIDE: string, TALK_MESSAGE_ROOM: string, WINDOW_CONSOLE_SHOWN: string, TALK_MESSAGE_CLIENT: string, VIEW_CONSOLE_CIRCUITS_PANEL: string, VIEW_CONSOLE_LEAVE_EXISTING_ROOM: string, APP_PULSE: string, DATASTORE_LOAD: string, TEAM_CLIENT: string, VIEW_CONSOLE_FERVIE_PANEL: string, TALK_TO_CLIENT: string, DATASTORE_LOADED: string, WINDOW_CONSOLE_BROWSER_REQUEST: string, APPLOADER_LOAD: string, MEMBER_CONTROLLER: string, TALK_LEAVE_ROOM: string, WINDOW_CONSOLE_BROWSER_LOAD: string, SCREENSHOT_COMPLETE: string, WINDOW_ACTIVATOR_CLOSE: string, MEMBER_CLIENT: string, VIEW_CONSOLE_TEAM_PANEL: string, APP_LOADED: string, TERMINAL_CLIENT: string, VIEW_CONSOLE_CIRCUIT_START_STOP: string, SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW: string}}
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
      WINDOW_LOADING_LOGIN_FAILED:
        prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_SHOWN: prefix + "window-console-shown",
      WINDOW_CONSOLE_SHOW_HIDE:
        prefix + "window-console-show-hide",
      WINDOW_ACTIVATOR_CLOSE:
        prefix + "window-activator-close",
      WINDOW_CONSOLE_BROWSER_REQUEST:
        prefix + "window-console-browser-request",
      WINDOW_CONSOLE_BROWSER_LOAD:
        prefix + "window-console-browser-load",
      TALK_CONNECTED: prefix + "talk-connected",
      TALK_CONNECT_FAILED: prefix + "talk-connect-failed",
      TALK_MESSAGE_CLIENT: prefix + "talk-message-client",
      TALK_MESSAGE_ROOM: prefix + "talk-message-room",
      TALK_JOIN_ROOM: prefix + "talk-join-room",
      TALK_LEAVE_ROOM: prefix + "talk-leave-room",
      TALK_TO_CLIENT: prefix + "talk-to-client",
      TEAM_CLIENT: prefix + "team-client",
      TEAM_CIRCUIT_CLIENT: prefix + "team-circuit-client",
      TERMINAL_CLIENT: prefix + "terminal-client",
      MEMBER_CLIENT: prefix + "member-client",
      MEMBER_CONTROLLER: prefix + "member-controller",
      JOURNAL_CLIENT: prefix + "journal-client",
      CIRCUIT_CLIENT: prefix + "circuit-client",
      FERVIE_CLIENT: prefix + "fervie-client",
      CHART_CLIENT: prefix + "chart-client",
      DICTIONARY_CLIENT: prefix + "dictionary-client",
      VIEW_CONSOLE_SIDEBAR_PANEL:
        prefix + "view-console-sidebar-panel",
      VIEW_CONSOLE_TEAM_PANEL:
        prefix + "view-console-team-panel",
      VIEW_CONSOLE_FERVIE_PANEL:
        prefix + "view-console-fervie-panel",
      VIEW_CONSOLE_CIRCUITS_PANEL:
        prefix + "view-console-circuits-panel",
      VIEW_CONSOLE_NOTIFICATIONS_PANEL:
        prefix + "view-console-notifications-panel",
      VIEW_CONSOLE_CIRCUIT_JOIN_LEAVE:
        "view-console-circuit-join-leave",
      VIEW_CONSOLE_CIRCUIT_START_STOP:
        "view-console-circuit-start-stop",
      VIEW_CONSOLE_CIRCUIT_PAUSE_RESUME:
        "view-console-circuit-pause-resume",
      VIEW_CONSOLE_CIRCUIT_SOLVE:
        "view-console-circuit-solve",
      VIEW_CONSOLE_JOIN_EXISTING_ROOM:
        "view-console-join-existing-room",
      VIEW_CONSOLE_LEAVE_EXISTING_ROOM:
        "view-console-leave-existing-room",
      VIEW_CONSOLE_ME_UPDATE: "view-console-me-update",
      APPACTIVATOR_SAVE_ACTIVATION:
        prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED:
        prefix + "appactivator-activation-saved",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      ME_DATA_REFRESH: prefix + "me-data-refresh",
      TEAM_DATA_REFRESH: prefix + "team-data-refresh",
      CIRCUIT_DATA_REFRESH: prefix + "circuit-data-refresh",
      JOURNAL_DATA_REFRESH: prefix + "journal-data-refresh",
      DICTIONARY_DATA_REFRESH: prefix + "dictionary-data-refresh",
      PREPARE_FOR_SCREENSHOT:
        prefix + "prepare-for-screenshot",
      READY_FOR_SCREENSHOT: prefix + "ready-for-screenshot",
      SCREENSHOT_COMPLETE: prefix + "screenshot-complete",
      SCREENSHOT_READY_FOR_DISPLAY:
        prefix + "screenshot-ready-for-display",
      SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW:
        prefix + "shortcuts-window-console-sidebar-show",
    };
  }
}
