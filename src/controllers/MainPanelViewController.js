import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    this.consoleBrowserLoadListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .WINDOW_CONSOLE_BROWSER_LOAD,
        this
      );
  }

  /**
   * configures the browser load listener. notified when we want to load new content
   * @param scope
   * @param callback
   */
  configureConsoleBrowserLoadListener(scope, callback) {
    this.consoleBrowserLoadListener.updateCallback(
      scope,
      callback
    );
  }

  static get Resources() {
    return {
      ERROR: "error",
      NONE: "none",
      TERMINAL: "terminal",
      JOURNAL: "journal",
      WTF: "wtf",
      RETRO: "retro",
      CIRCUIT: "circuit",
      FLOW: "flow",
      PLAY: "play",
      MOOVIE: "moovie",
      TOOLS: "tools",
      DASHBOARD: "dashboard",
    };
  }

  static get Animations() {
    return {
      FLY_RIGHT: "fly right",
      FLY_LEFT: "fly left",
      DROP: "drop",
    };
  }

  static get AnimationTimes() {
    return {
      CONSOLE_CONTENT: 420,
    };
  }
}
