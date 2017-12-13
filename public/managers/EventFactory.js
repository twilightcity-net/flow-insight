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
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      APPLOADER_LOAD: prefix + "apploader-load",
      SHORTCUTS_CREATED: prefix + "shortcuts-created",
      SHORTCUTS_RECIEVED: prefix + "shortcuts-recieved",
      SUBMIT_BUG_REPORT: prefix + "bugreport-submitted"
    };
  }
};
