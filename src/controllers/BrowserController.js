import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class BrowserController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.mainPanelChangeListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this
    );
    this.showConsoleWindowListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
      this
    );
  }

  configureMainPanelChangeListener(scope, callback) {
    this.mainPanelChangeListener.updateCallback(scope, callback);
  }

  configureShowConsoleWindowListener(scope, callback) {
    this.showConsoleWindowListener.updateCallback(scope, callback);
  }
}
