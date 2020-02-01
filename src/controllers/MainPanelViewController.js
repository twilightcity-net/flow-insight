import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    this.oldMenuSelection = null;
    this.activeMenuSelection = MainPanelViewController.MenuSelection.DEFAULT;
    this.resetDefaultMenuSelection();
    this.mainPanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this
    );
    this.contentPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this
    );
    this.menuListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this
    );
    this.heartbeatListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.APP_HEARTBEAT,
      this
    );
    this.pulseListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.APP_PULSE,
      this
    );
    this.hideConsoleWindowNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );
    this.consoleBrowserLoadListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_BROWSER_LOAD,
      this
    );
  }

  configureContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  configureHeartbeatListener(scope, callback) {
    this.heartbeatListener.updateCallback(scope, callback);
  }

  configurePulseListener(scope, callback) {
    this.pulseListener.updateCallback(scope, callback);
  }

  /**
   * configures the browser load listener. notified when we want to load new content
   * @param scope
   * @param callback
   */
  configureConsoleBrowserLoadListener(scope, callback) {
    this.consoleBrowserLoadListener.updateCallback(scope, callback);
  }

  changeActivePanel(oldState, newState) {
    this.oldMenuSelection = oldState;
    this.activeMenuSelection = newState;
    this.fireNotifyEvent(newState);
  }

  fireNotifyEvent(state) {
    this.mainPanelChangeNotifier.dispatch(state);
  }

  hideConsoleWindow() {
    this.hideConsoleWindowNotifier.dispatch(1);
  }

  resetDefaultMenuSelection() {
    this.activeMenuSelection = MainPanelViewController.MenuSelection.DEFAULT;
  }

  static get MenuSelection() {
    return {
      DEFAULT: "journal",
      JOURNAL: "journal",
      TROUBLESHOOT: "troubleshoot",
      FLOW: "flow"
    };
  }
}
