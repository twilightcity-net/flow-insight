import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";

/**
 * used to control the browser header class
 */
export class BrowserController extends ActiveViewController {
  /**
   * builds the browser console header component
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.name = "[BrowserController]";
    this.consoleBrowserRequestListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .WINDOW_CONSOLE_BROWSER_REQUEST,
      this
    );
    this.consoleBrowserLoadNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .WINDOW_CONSOLE_BROWSER_LOAD,
      this
    );
    this.showConsoleWindowListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );
  }

  /**
   * helper wrapper function use to perform a browser request to load content
   * @param request
   */
  makeRequest(request) {
    this.consoleBrowserRequestListener.dispatch(request);
  }

  /**
   * configures the browsers request listener
   * @param scope
   * @param callback
   */
  configureConsoleBrowserRequestListener(scope, callback) {
    this.consoleBrowserRequestListener.updateCallback(
      scope,
      callback
    );
  }

  configureConsoleBrowserLoadListener(scope, callback) {
    this.consoleBrowserLoadNotifier.updateCallback(
      scope,
      callback
    );
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
  configureShowConsoleWindowListener = (
    scope,
    callback
  ) => {
    this.showConsoleWindowListener.updateCallback(
      scope,
      callback
    );
  };

  /**
   * processes a given request and returns resource objest that the console content
   * component will use to figure out what to render
   * @param request
   */
  processRequest = request => {
    console.log(
      this.name + " process request -> " + request
    );
    try {
      let resource = UtilRenderer.getResourceFromRequest(
        request
      );
      this.fireConsoleBrowserLoadNotifyEvent(resource);
    } catch (e) {
      console.log(e);
    }
  };
}
