import { RendererEvent } from "./RendererEventManager";

/**
 * This class is used as a helper class to store event names from
 * ./public/EventManager. When adding a new event make sure to update
 * the other file if you wish to listen to the events
 */
export class RendererEventFactory {
  /**
   * creates te event from the factory to use
   * @param type
   * @param args
   * @returns {RendererEvent}
   */
  static createEvent(type, ...args) {
    return new RendererEvent(type, ...args);
  }

  /**
   * static enum subclass to store event names
   * @returns {{SCREENSHOT_READY_FOR_DISPLAY: string, READY_FOR_SCREENSHOT: string, DATASTORE_LOAD: string, VIEW_CONSOLE_SPIRIT_PANEL: string, APP_HEARTBEAT: string, DATASTORE_LOADED: string, APPACTIVATOR_ACTIVATION_SAVED: string, APP_QUIT: string, VIEW_CONSOLE_MENU_CHANGE: string, APPACTIVATOR_SAVE_ACTIVATION: string, APPLOADER_LOAD: string, PREPARE_FOR_SCREENSHOT: string, WINDOW_LOADING_LOGIN_FAILED: string, VIEW_CONSOLE_SIDEBAR_PANEL: string, SCREENSHOT_COMPLETE: string, WINDOW_CONSOLE_SHOW_HIDE: string, WINDOW_ACTIVATOR_CLOSE: string, APP_LOADED: string, SUBMIT_BUG_REPORT: string}}
   * @constructor
   */
  static get Events() {
    let prefix = "ipc-";
    return {
      APP_QUIT: prefix + "app-quit",
      APP_HEARTBEAT: prefix + "app-heartbeat",
      APPLOADER_LOAD: prefix + "apploader-load",
      APP_LOADED: prefix + "app-loaded",
      WINDOW_LOADING_LOGIN_FAILED: prefix + "window-loading-login-failed",
      WINDOW_CONSOLE_SHOW_HIDE: prefix + "window-console-show-hide",
      WINDOW_ACTIVATOR_CLOSE: prefix + "window-activator-close",
      TALK_CONNECTED: prefix + "talk-connected",
      TALK_CONNECT_FAILED: prefix + "talk-connect-failed",
      TALK_MESSAGE_CLIENT: prefix + "talk-message-client",
      TALK_MESSAGE_ROOM: prefix + "talk-message-room",
      TALK_JOIN_ROOM: prefix + "talk-join-room",
      TALK_LEAVE_ROOM: prefix + "talk-leave-room",
      VIEW_CONSOLE_SIDEBAR_PANEL: prefix + "view-console-sidebar-panel",
      VIEW_CONSOLE_SPIRIT_PANEL: prefix + "view-console-spirit-panel",
      VIEW_CONSOLE_MENU_CHANGE: prefix + "view-console-menu-change",
      SUBMIT_BUG_REPORT: prefix + "bugreport-submitted",
      APPACTIVATOR_SAVE_ACTIVATION: prefix + "appactivator-save-activation",
      APPACTIVATOR_ACTIVATION_SAVED: prefix + "appactivator-activation-saved",
      DATASTORE_LOAD: prefix + "datastore-load",
      DATASTORE_LOADED: prefix + "datastore-loaded",
      PREPARE_FOR_SCREENSHOT: prefix + "prepare-for-screenshot",
      READY_FOR_SCREENSHOT: prefix + "ready-for-screenshot",
      SCREENSHOT_COMPLETE: prefix + "screenshot-complete",
      SCREENSHOT_READY_FOR_DISPLAY: prefix + "screenshot-ready-for-display"
    };
  }
}
