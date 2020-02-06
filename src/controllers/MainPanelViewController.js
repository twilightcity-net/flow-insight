import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { ActiveViewControllerFactory } from "./ActiveViewControllerFactory";

export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    this.consoleBrowserLoadListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.WINDOW_CONSOLE_BROWSER_LOAD,
      this
    );
  }

  /**
   * configures the browser load listener. notified when we want to load new content
   * @param scope
   * @param callback
   */
  configureConsoleBrowserLoadListener(scope, callback) {
    this.consoleBrowserLoadListener.updateCallback(scope, callback);
  }

  static get Resources() {
    return {
      NONE: "none",
      JOURNAL: "journal",
      CIRCUIT: "circuit",
      FLOW: "flow"
    };
  }

  static get Animations() {
    return {
      FLY_RIGHT: "fly right",
      FLY_LEFT: "fly left",
      DROP: "drop"
    };
  }

  static get AnimationTimes() {
    return {
      CONSOLE_CONTENT: 420
    };
  }
}
