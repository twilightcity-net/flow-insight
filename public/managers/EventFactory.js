const log = require("electron-log"),
  { EventManager, MainEvent } = require("./EventManager");

/* 
 * a factory class used to create new events
 */
module.exports = class EventFactory {
  /*
   * creates and returns a new Event Object
   */
  static createEvent(type, ...args) {
    log.info("[EventFactory] create event -> " + type);
    let event = new MainEvent(type, ...args);
    return event;
  }

  /*
   * static enum to store event types. These are basically the type
   * of possible events that can be dispatched by the Manager.
   */
  static get Types() {
    let prefix = "metaos-ipc-";
    return {
      WINDOW_FOCUS: prefix + "window-focus",
      WINDOW_BLUR: prefix + "window-blur",
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_LOADING_LOGIN: prefix + "window-loading-login",
      WINDOW_LOADING_LOGIN_FAILED: prefix + "window-loading-login-failed",
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
      DATASTORE_LOADED: prefix + "datastore-loaded"
    };
  }
};
