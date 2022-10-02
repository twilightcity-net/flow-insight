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
   * @constructor
   */
  static get Events() {
    let prefix = "ipc-";
    return {
      APP_HEARTBEAT: prefix + "app-heartbeat",
      APP_PULSE: prefix + "app-pulse",
      APPLOADER_LOAD: prefix + "apploader-load",
      APP_LOADED: prefix + "app-loaded",
      APP_QUIT: prefix + "app-quit",
      APP_INTRO_DONE: prefix + "app-intro-done",
      WINDOW_LOADING_LOGIN_FAILED:
        prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_SHOWN: prefix + "window-console-shown",
      WINDOW_CONSOLE_HIDDEN: prefix + "window-console-shown",
      WINDOW_CONSOLE_SHOW_HIDE:
        prefix + "window-console-show-hide",
      WINDOW_CHAT_CONSOLE_SHOW_HIDE: prefix + "window-chat-console-show-hide",
      WINDOW_CHAT_CONSOLE_SHOWN: prefix + "window-chat-console-shown",
      WINDOW_CHAT_CONSOLE_HIDDEN: prefix + "window-chat-console-hidden",
      WINDOW_CHAT_CONSOLE_BLUR: prefix + "window-chat-console-blur",

      WINDOW_MOOVIE_CONSOLE_SHOW_HIDE: prefix + "window-moovie-console-show-hide",
      WINDOW_MOOVIE_CONSOLE_SHOWN: prefix + "window-moovie-console-shown",
      WINDOW_MOOVIE_CONSOLE_HIDDEN: prefix + "window-moovie-console-hidden",
      WINDOW_MOOVIE_CONSOLE_BLUR: prefix + "window-moovie-console-blur",
      WINDOW_ACTIVATOR_CLOSE:
        prefix + "window-activator-close",
      WINDOW_CONSOLE_BROWSER_REQUEST:
        prefix + "window-console-browser-request",
      WINDOW_CONSOLE_BROWSER_LOAD:
        prefix + "window-console-browser-load",
      WINDOW_OPEN_CHART: prefix + "window-open-chart",
      WINDOW_CLOSE_CHART: prefix + "window-close-chart",
      WINDOW_OPEN_DM: prefix + "window-open-dm",
      WINDOW_CLOSE_DM: prefix + "window-close-dm",
      WINDOW_CLOSE_HOTKEY_CONFIG: prefix + "window-close-hotkey-config",
      WINDOW_CLOSE_INVITATION_KEY: prefix + "window-close-invitation-key",
      WINDOW_CLOSE_ORG_SWITCHER: prefix + "window-close-org-switcher",
      WINDOW_CLOSE_PLUGIN_DIALOG: prefix + "window-close-plugin-dialog",
      WINDOW_CLOSE_MODULE_DIALOG: prefix + "window-close-module-dialog",
      WINDOW_OPEN_MOOVIE: prefix + "window-open-moovie",
      WINDOW_CLOSE_MOOVIE: prefix + "window-close-moovie",
      WINDOW_FERVIE_SHOW_HIDE: prefix + "window-fervie-show-hide",
      WINDOW_FERVIE_SHOWING: prefix + "window-fervie-showing",
      WINDOW_FERVIE_HIDING: prefix + "window-fervie-hiding",
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
      CODE_CLIENT: prefix + "code-client",
      MOOVIE_CLIENT: prefix + "moovie-client",
      ACCOUNT_CLIENT: prefix + "account-client",
      CIRCUIT_MEMBER_CLIENT: prefix + "circuit-member-client",
      NOTIFICATION_CLIENT: prefix + "notification-client",
      HOTKEY_CLIENT: prefix + "hotkey-client",
      FEATURE_TOGGLE_CLIENT: prefix + "feature-toggle-client",
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
      VIEW_CONSOLE_DASHBOARD_PANEL:
        prefix + "view-console-dashboard-panel",
      VIEW_CONSOLE_CIRCUIT_JOIN_LEAVE:
        "view-console-circuit-join-leave",
      VIEW_CONSOLE_CIRCUIT_JOIN_FAIL:
        "view-console-circuit-join-fail",
      VIEW_CONSOLE_CIRCUIT_STATE_CHANGE_FAIL:
        "view-console-circuit-state-change-fail",
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
      VIEW_CONSOLE_JOIN_EXISTING_ROOM_FAIL:
        "view-console-join-existing-room-fail",
      VIEW_CONSOLE_ME_UPDATE: "view-console-me-update",
      VIEW_CONSOLE_NOTIFICATION_READ_UPDATE:
        "view-console-notification-read-update",

      APPACTIVATOR_SAVE_ACTIVATION:
        prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED:
        prefix + "appactivator-activation-saved",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      ME_DATA_REFRESH: prefix + "me-data-refresh",
      TEAM_DATA_REFRESH: prefix + "team-data-refresh",
      BUDDIES_DATA_REFRESH: prefix + "buddies-data-refresh",
      CIRCUIT_DATA_REFRESH: prefix + "circuit-data-refresh",
      JOURNAL_DATA_REFRESH: prefix + "journal-data-refresh",
      FEATURE_TOGGLE_DATA_REFRESH: prefix + "feature-toggle-data-refresh",
      DM_DATA_REFRESH: prefix + "dm-data-refresh",
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
      SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW:
        prefix + "shortcuts-window-console-sidebar-show",
      GLOBAL_HUD_INPUT_LOCK:
        prefix + "global-hud-input-lock",
      MOOVIE_START: prefix + "moovie-start",
      MOOVIE_STOP: prefix + "moovie-stop",
      GET_REGISTERED_PLUGIN_LIST: "get-registered-plugin-list",
      REGISTER_PLUGIN: "register-plugin",
    };
  }
}
