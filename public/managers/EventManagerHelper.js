/*
 * Simpler helper function for the EventManager used to store the
 * names of the applications various events
 */

module.exports = class EventManagerHelper {
  /*
   * static enum to store event names. These are basically the type
   * of possible events that can be dispatched by the Manager. When adding new 
   * events make sure to update this and ./src/EventManagerHelper 
   */
  static get Events() {
    let prefix = "metaos-ipc-";
    return {
      WINDOW_LOADING_SHOWN: prefix + "window-loading-shown",
      WINDOW_CONSOLE_READY: prefix + "window-console-ready",
      APPLOADER_LOAD: prefix + "apploader-load",
      SHORTCUTS_CREATED: prefix + "shortcuts-created"
    };
  }
};
