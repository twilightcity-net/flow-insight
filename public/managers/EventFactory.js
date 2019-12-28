const log = require("electron-log"),
  { MainEvent } = require("./EventManager");

/**
 * a factory class used to create new events
 * @type {EventFactory}
 */
module.exports = class EventFactory {
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
   * static enum to store event types. These are basically the type of possible events that can be dispatched by the Manager.
   * @returns {{WINDOW_LOADING_SHOWN: string, SCREENSHOT_READY_FOR_DISPLAY: string, TALK_CONNECTED: string, WINDOW_CONSOLE_READY: string, READY_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN: string, DATASTORE_LOAD: string, TALK_RECONNECTED: string, SHORTCUTS_RECIEVED: string, APP_HEARTBEAT: string, DATASTORE_LOADED: string, APPACTIVATOR_ACTIVATION_SAVED: string, APP_QUIT: string, APPACTIVATOR_SAVE_ACTIVATION: string, SHORTCUTS_CREATED: string, APPLOADER_LOAD: string, WINDOW_FOCUS: string, PREPARE_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN_FAILED: string, WINDOW_BLUR: string, SCREENSHOT_COMPLETE: string, WINDOW_CONSOLE_SHOW_HIDE: string, WINDOW_ACTIVATOR_CLOSE: string, SUBMIT_BUG_REPORT: string}}
   * @constructor
   */
  static get Types() {
    let prefix = "ipc-";
    return {
      APP_QUIT: prefix + "app-quit",
      APP_HEARTBEAT: prefix + "app-heartbeat",
      WINDOW_FOCUS: prefix + "window-focus",
      WINDOW_BLUR: prefix + "window-blur",
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_LOADING_LOGIN: prefix + "window-loading-login",
      WINDOW_LOADING_LOGIN_FAILED: prefix + "window-loading-login-failed",
      TALK_CONNECTED: prefix + "window-talk-connected",
      TALK_RECONNECTED: prefix + "window-talk-reconnected",
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      WINDOW_CONSOLE_SHOW_HIDE: prefix + "window-console-show-hide",
      WINDOW_ACTIVATOR_CLOSE: prefix + "window-activator-close",
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
};
