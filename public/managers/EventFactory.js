const log = require("electron-log"),
  { EventManager, MainEvent } = require("./EventManager");

/* 
 * a factory class used to create new events
 */
module.exports = class EventFactory {
  /*
   * creates and returns a new Event Object
   */
  static createEvent(type, scope, callback, reply, async) {
    log.info("[EventFactory] create event -> " + type);
    let event = new MainEvent(type, scope, reply, async);
    // global.App.EventManager.initSender(event);
    // global.App.EventManager.initReturnValues(event);
    // global.App.EventManager.register(event);
    return event;
  }

  /*
   * static enum to store event types. These are basically the type
   * of possible events that can be dispatched by the Manager. When adding new 
   * events make sure to update this and ./src/EventManagerHelper 
   */
  static get Types() {
    let prefix = "metaos-ipc-";
    return {
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      APPLOADER_LOAD: prefix + "apploader-load",
      SHORTCUTS_CREATED: prefix + "shortcuts-created"
    };
  }
};
