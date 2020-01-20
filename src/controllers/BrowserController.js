import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

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
    this.consoleBrowserLoadNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_BROWSER_LOAD,
      this
    );
    this.mainPanelChangeListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this
    );
    this.showConsoleWindowListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );
  }

  dispatchLoadBrowserContent(resource) {
    this.consoleBrowserLoadNotifier.dispatch(resource);
  }

  /**
   * callback function that is notified when the main console menu changes
   * @param scope
   * @param callback
   */
  configureMainPanelChangeListener(scope, callback) {
    this.mainPanelChangeListener.updateCallback(scope, callback);
  }

  /**
   * callback function that is notificed when the console is shown or hidden
   * @param scope
   * @param callback
   */
  configureShowConsoleWindowListener(scope, callback) {
    this.showConsoleWindowListener.updateCallback(scope, callback);
  }

  processCommand = command => {
    console.log(this.name + " process the command : " + command);
    try {
      let cmd = command.split(" "),
        action = cmd[0],
        uri = cmd[1],
        uriArr = uri.split("/"),
        uriRoot = uriArr[1],
        uriRes = uriArr[2],
        uriChild = uriArr[3],
        resource = {
          action: action,
          uri: uri,
          root: uriRoot,
          res: uriRes,
          child: uriChild
        };
      this.dispatchLoadBrowserContent(resource);
    } catch (e) {
      console.log(e);
    }
  };
}
