import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../RendererEventFactory";

export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.oldMenuSelection = null;
    this.activeMenuSelection = MainPanelViewController.MenuSelection.JOURNAL;

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
  }

  configureContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  changeActivePanel(oldState, newState) {
    this.oldMenuSelection = oldState;
    this.activeMenuSelection = newState;
    this.fireNotifyEvent();
  }

  fireNotifyEvent() {
    this.mainPanelChangeNotifier.dispatch({});
  }

  resetDefaultMenuSelection() {
    this.activeMenuSelection = MainPanelViewController.MenuSelection.JOURNAL;
  }

  static get MenuSelection() {
    return {
      JOURNAL: "journal",
      TROUBLESHOOT: "troubleshoot",
      FLOW: "flow",
      PROJECTS: "projects",
      CIRCLES: "circles"
    };
  }
}
