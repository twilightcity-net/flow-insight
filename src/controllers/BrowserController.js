import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";

/**
 * used to control the browser header class
 */
export class BrowserController extends ActiveViewController {
  static uri = null;
  static MAX_HISTORY_SIZE = 10;

  /**
   * builds the browser console header component
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.name = "[BrowserController]";

    this.requestHistory = [];
    this.historyBackIndex = 0;

    this.consoleBrowserLoadNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_CONSOLE_BROWSER_LOAD,
        this
      );
    this.showConsoleWindowListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_CONSOLE_SHOW_HIDE,
        this
      );
    this.featureToggleListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .FEATURE_TOGGLE_SCREEN_REFRESH,
        this
      );
  }

  /**
   * helper wrapper function use to perform a browser request to load content
   * @param request
   */
  makeRequest(request) {
    console.log("Browser request!");
    this.pushRequestToHistory(request);
    this.processRequest(request);
  }

  hasNoForwardHistory() {
    return this.historyBackIndex === 0;
  }

  hasNoBackwardHistory() {
    return this.requestHistory.length === 1
      || (this.requestHistory.length + this.historyBackIndex - 2 < 0);
  }

  goBackInHistory() {
    console.log("Go back in history");
    this.moveInHistory( this.historyBackIndex - 1);
  }

  goForwardInHistory() {
    console.log("Go forward in history");
    this.moveInHistory(this.historyBackIndex + 1);
  }

  moveInHistory(newHistoryBackIndex) {
    let requestIndex = this.requestHistory.length + newHistoryBackIndex - 1;

    if (requestIndex >= 0 && requestIndex < this.requestHistory.length) {
      let request = this.requestHistory[requestIndex];
      this.historyBackIndex = newHistoryBackIndex;
      this.processRequest(request);
    } else {
      console.log("Invalid request index");
    }
  }


  configureConsoleBrowserLoadListener(scope, callback) {
    this.consoleBrowserLoadNotifier.updateCallback(
      scope,
      callback
    );
  }

  /**
   * Push the latest request to our request history, so we can use the back and forward buttons
   * @param request
   */
  pushRequestToHistory(request) {

    if (this.historyBackIndex < 0) {
      let requestIndex = this.requestHistory.length + this.historyBackIndex - 1;
      this.requestHistory.splice(requestIndex + 1);
      this.historyBackIndex = 0;
    }

    this.requestHistory.push(request);

    if (this.requestHistory.length > BrowserController.MAX_HISTORY_SIZE) {
      this.requestHistory.splice(0, 1);
    }

  }

  /**
   * Register for events when feature toggles are update
   * @param scope
   * @param callback
   */
  configureFeatureToggleListener(scope, callback) {
    this.featureToggleListener.updateCallback(
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
   * sets our current uri to a static variable any other controller can access
   * @param resource
   */
  setUri(resource) {
    BrowserController.uri = resource.uri;
  }

  /**
   * processes a given request and returns resource objest that the console content
   * component will use to figure out what to render
   * @param request
   */
  processRequest = (request) => {
    console.log(this.name + " process request -> " + request);
    try {
      let resource = UtilRenderer.getResourceFromRequest(request);
      this.setUri(resource);
      this.fireConsoleBrowserLoadNotifyEvent(resource);
    } catch (e) {
      console.log(e);
    }
  };
}
