const { MainEvent } = require("./EventManager");

/**
 * a factory class used to create new events
 * @type {EventFactory}
 */
class EventFactory {
  /**
   * creates and returns a new Event Object
   * @param type
   * @param args
   * @returns {MainEvent}
   */
  static createEvent(type, ...args) {
    let event = new MainEvent(type, ...args);
    return event;
  }

  /**
   * static enum to store event types. These are basically the type of possible events that can be dispatched by the Manager
   * @returns {{SCREENSHOT_READY_FOR_DISPLAY: string, WINDOW_CONSOLE_READY: string, TALK_CONNECT_FAILED: string, READY_FOR_SCREENSHOT: string, CIRCUIT_CLIENT: string, SHORTCUTS_RECIEVED: string, APP_HEARTBEAT: string, TALK_CONNECTED: string, TALK_JOIN_ROOM: string, APPACTIVATOR_ACTIVATION_SAVED: string, APP_QUIT: string, APPACTIVATOR_SAVE_ACTIVATION: string, WINDOW_FOCUS: string, PREPARE_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN_FAILED: string, WINDOW_CONSOLE_SHOW_HIDE: string, TALK_MESSAGE_ROOM: string, WINDOW_LOADING_SHOWN: string, WINDOW_CONSOLE_SHOWN: string, TALK_MESSAGE_CLIENT: string, APP_PULSE: string, WINDOW_LOADING_LOGIN: string, DATASTORE_LOAD: string, DATASTORE_LOADED: string, SHORTCUTS_CREATED: string, APPLOADER_LOAD: string, TALK_LEAVE_ROOM: string, WINDOW_CONSOLE_BROWSER_LOAD: string, WINDOW_BLUR: string, SCREENSHOT_COMPLETE: string, WINDOW_ACTIVATOR_CLOSE: string, SUBMIT_BUG_REPORT: string}}
   * @constructor
   */
  static get Types() {
    let prefix = "ipc-";
    return {
      APP_QUIT: prefix + "app-quit",
      APP_HEARTBEAT: prefix + "app-heartbeat",
      APP_PULSE: prefix + "app-pulse",
      WINDOW_FOCUS: prefix + "window-focus",
      WINDOW_BLUR: prefix + "window-blur",
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_LOADING_LOGIN: prefix + "window-loading-login",
      WINDOW_LOADING_LOGIN_FAILED: prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      WINDOW_CONSOLE_SHOWN: prefix + "window-console-shown",
      WINDOW_CONSOLE_SHOW_HIDE: prefix + "window-console-show-hide",
      WINDOW_CONSOLE_BROWSER_REQUEST: prefix + "window-console-browser-request",
      WINDOW_CONSOLE_BROWSER_LOAD: prefix + "window-console-browser-load",
      WINDOW_ACTIVATOR_CLOSE: prefix + "window-activator-close",
      TALK_CONNECTED: prefix + "talk-connected",
      TALK_CONNECT_FAILED: prefix + "talk-connect-failed",
      TALK_MESSAGE_CLIENT: prefix + "talk-message-client",
      TALK_MESSAGE_ROOM: prefix + "talk-message-room",
      TALK_JOIN_ROOM: prefix + "talk-join-room",
      TALK_LEAVE_ROOM: prefix + "talk-leave-room",
      CIRCUIT_CLIENT: prefix + "circuit-client",
      APPACTIVATOR_SAVE_ACTIVATION: prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED: prefix + "appactivator-activation-saved",
      APPLOADER_LOAD: prefix + "apploader-load",
      SHORTCUTS_CREATED: prefix + "shortcuts-created",
      SHORTCUTS_RECIEVED: prefix + "shortcuts-recieved",
      SUBMIT_BUG_REPORT: prefix + "bugreport-submitted",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      PREPARE_FOR_SCREENSHOT: prefix + "prepare-for-screenshot",
      READY_FOR_SCREENSHOT: prefix + "ready-for-screenshot",
      SCREENSHOT_COMPLETE: prefix + "screenshot-complete",
      SCREENSHOT_READY_FOR_DISPLAY: prefix + "screenshot-ready-for-display"
    };
  }
}

module.exports = EventFactory;
