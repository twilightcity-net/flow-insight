const { MainEvent } = require("./EventManager");

/**
 * a factory class used to create new events
 * @type {EventFactory}
 */
class EventFactory {
  /**
   * creates and returns a new Event Object
   * @param type
   * @param scope
   * @param callback
   * @param reply
   * @param async
   * @returns {MainEvent}
   */
  static createEvent(type, scope, callback, reply, async) {
    return new MainEvent(
      type,
      scope,
      callback,
      reply,
      async
    );
  }

  /**
   * Static enum to store event types. These are basically the type of possible events that can be dispatched by the Manager.
   * @constructor
   */
  static get Types() {
    let prefix = "ipc-";
    return {
      APP_QUIT: prefix + "app-quit",
      APP_HEARTBEAT: prefix + "app-heartbeat",
      APP_PULSE: prefix + "app-pulse",
      APP_INTRO_DONE: prefix + "app-intro-done",
      DATABASE_CLIENT: prefix + "database-client",
      DATABASE_VOLUMES_READY:
        prefix + "database-farm-ready",
      TEAM_CLIENT: prefix + "team-client",
      TEAM_CIRCUIT_CLIENT: prefix + "team-circuit-client",
      MEMBER_CLIENT: prefix + "member-client",
      MEMBER_CONTROLLER: prefix + "member-controller",
      JOURNAL_CLIENT: prefix + "journal-client",
      DICTIONARY_CLIENT: prefix + "dictionary-client",
      NOTIFICATION_CLIENT: prefix + "notification-client",
      FERVIE_CLIENT: prefix + "fervie-client",
      MOOVIE_CLIENT: prefix + "moovie-client",
      CIRCUIT_MEMBER_CLIENT: prefix + "circuit-member-client",
      TERMINAL_CLIENT: prefix + "terminal-client",
      CHART_CLIENT: prefix + "chart-client",
      HOTKEY_CLIENT: prefix + "hotkey-client",
      WINDOW_FOCUS: prefix + "window-focus",
      WINDOW_BLUR: prefix + "window-blur",
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_LOADING_LOGIN: prefix + "window-loading-login",
      WINDOW_LOADING_LOGIN_FAILED:
        prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      WINDOW_CONSOLE_SHOWN: prefix + "window-console-shown",
      WINDOW_CONSOLE_SHOW_HIDE:
        prefix + "window-console-show-hide",
      WINDOW_CONSOLE_BROWSER_REQUEST:
        prefix + "window-console-browser-request",
      WINDOW_CONSOLE_BROWSER_LOAD:
        prefix + "window-console-browser-load",
      WINDOW_ACTIVATOR_CLOSE:
        prefix + "window-activator-close",
      WINDOW_CHAT_CONSOLE_SHOW_HIDE:
        prefix + "window-chat-console-show-hide",
      WINDOW_CHAT_CONSOLE_SHOWN:
        prefix + "window-chat-console-shown",
      WINDOW_CHAT_CONSOLE_HIDDEN:
        prefix + "window-chat-console-hidden",
      WINDOW_CHAT_CONSOLE_BLUR:
        prefix + "window-chat-console-blur",
      WINDOW_OPEN_CHART: prefix + "window-open-chart",
      WINDOW_CLOSE_CHART: prefix + "window-close-chart",
      WINDOW_OPEN_MOOVIE: prefix + "window-open-moovie",
      WINDOW_CLOSE_MOOVIE: prefix + "window-close-moovie",
      WINDOW_CLOSE_HOTKEY_CONFIG: prefix + "window-close-hotkey-config",
      WINDOW_CHART_SHOWN: prefix + "window-chart-shown",
      WINDOW_CHART_CLOSED: prefix + "window-chart-closed",
      TALK_CONNECTED: prefix + "talk-connected",
      TALK_CONNECT_FAILED: prefix + "talk-connect-failed",
      TALK_MESSAGE_CLIENT: prefix + "talk-message-client",
      TALK_MESSAGE_ROOM: prefix + "talk-message-room",
      TALK_JOIN_ROOM: prefix + "talk-join-room",
      TALK_LEAVE_ROOM: prefix + "talk-leave-room",
      TALK_TO_CLIENT: prefix + "talk-to-client",
      CIRCUIT_CLIENT: prefix + "circuit-client",
      APPACTIVATOR_SAVE_ACTIVATION:
        prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED:
        prefix + "appactivator-activation-saved",
      APPLOADER_LOAD: prefix + "apploader-load",
      SHORTCUTS_CREATED: prefix + "shortcuts-created",
      SHORTCUTS_RECIEVED: prefix + "shortcuts-recieved",
      SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW:
        prefix + "shortcuts-window-console-sidebar-show",
      UPDATE_SHORTCUTS:
        prefix + "update-shortcuts",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      ME_DATA_REFRESH: prefix + "me-data-refresh",
      TEAM_DATA_REFRESH: prefix + "team-data-refresh",
      CIRCUIT_DATA_REFRESH: prefix + "circuit-data-refresh",
      JOURNAL_DATA_REFRESH: prefix + "journal-data-refresh",
      DICTIONARY_DATA_REFRESH:
        prefix + "dictionary-data-refresh",
      NOTIFICATION_DATA_REFRESH:
        prefix + "notification-data-refresh",
      PREPARE_FOR_SCREENSHOT:
        prefix + "prepare-for-screenshot",
      READY_FOR_SCREENSHOT: prefix + "ready-for-screenshot",
      SCREENSHOT_COMPLETE: prefix + "screenshot-complete",
      SCREENSHOT_READY_FOR_DISPLAY:
        prefix + "screenshot-ready-for-display",
    };
  }
}

module.exports = EventFactory;
