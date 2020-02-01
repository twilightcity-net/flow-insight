import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";

/**
 * used to control the browser header class
 */
export class BrowserController extends ActiveViewController {
  static get URI_SEPARATOR() {
    return "::";
  }

  static get PATH_SEPARATOR() {
    return "/";
  }

  static get ACTION_ERROR() {
    return "error";
  }

  static get URI_ERROR() {
    return "error";
  }

  static get Actions() {
    return {
      OPEN: "open",
      CLOSE: "close",
      JOIN: "join",
      LEAVE: "leave"
    };
  }

  static get Locations() {
    return {
      CIRCUIT: "circuit",
      JOURNAL: "journal",
      WTF: "wtf",
      ROOM: "room"
    };
  }

  /**
   * builds the browser console header component
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.name = "[BrowserController]";
    this.consoleBrowserRequestListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_BROWSER_REQUEST,
      this
    );
    this.consoleBrowserLoadNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_BROWSER_LOAD,
      this
    );
    this.showConsoleWindowListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );
  }

  /**
   * configures the browsers request listener
   * @param scope
   * @param callback
   */
  configureConsoleBrowserRequestListener(scope, callback) {
    this.consoleBrowserRequestListener.updateCallback(scope, callback);
  }

  /**
   * event that is dispathed to tell the console content what to load
   * @param resource - the resource to send to console content component
   */
  fireConsoleBrowserLoadNotifyEvent(resource) {
    this.consoleBrowserLoadNotifier.dispatch(resource);
  }

  /**
   * callback function that is notificed when the console is shown or hidden
   * @param scope
   * @param callback
   */
  configureShowConsoleWindowListener = (scope, callback) => {
    this.showConsoleWindowListener.updateCallback(scope, callback);
  };

  processRequest = request => {
    console.log(this.name + " process request -> " + request);
    try {
      let resource = UtilRenderer.getResourceFromRequest(request);
      this.fireConsoleBrowserLoadNotifyEvent(resource);
    } catch (e) {
      console.log(e);
    }
  };
}
