import { RendererEvent } from "./RendererEventManager";

const { remote } = window.require("electron"),
  log = remote.require("electron-log");

//
//This class is used as a helper class to store event names from
//  * ./public/EventManager. When adding a new event make sure to update
// the other file if you wish to listen to the events
//
export class RendererEventFactory {
  static createEvent(type, ...args) {
    log.info("[RendererEventFactory] create event -> " + type);
    let event = new RendererEvent(type, ...args);
    return event;
  }

  ///static enum subclass to store event names
  static get Events() {
    let prefix = "metaos-ipc-";
    return {
      APPLOADER_LOAD: prefix + "apploader-load",
      WINDOW_CONSOLE_SHOW_HIDE: prefix + "window-console-show-hide",
      WINDOW_ACTIVATOR_CLOSE: prefix + "window-activator-close",
      VIEW_CONSOLE_SIDEBAR_PANEL: prefix + "view-console-sidebar-panel",
      VIEW_CONSOLE_MENU_CHANGE: prefix + "view-console-menu-change",
      SUBMIT_BUG_REPORT: prefix + "bugreport-submitted",
      APPACTIVATOR_SAVE_ACTIVATION: prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED: prefix + "appactivator-activation-saved",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded"
    };
  }
}
