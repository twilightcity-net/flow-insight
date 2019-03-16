
import {ActiveViewController} from "./ActiveViewController";
import {RendererEventFactory} from "../RendererEventFactory";


export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.oldMenuSelection = null;
    this.activeMenuSelection = null;

    this.resetDefaultMenuSelection();

    this.mainContentPanelNotify = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this);

    this.mainContentPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this);

    this.mainMenuListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_MENU_CHANGE,
      this);
  }

  configureMainContentListener(scope, callback) {
    this.mainContentPanelListener.updateCallback(scope, callback);
  }

  configureMainMenuListener(scope, callback) {
    this.mainMenuListener.updateCallback(scope, callback);
  }

  changeActivePanel(oldState, newState) {
     this.oldMenuSelection = oldState;
     this.activeMenuSelection = newState;
    this.fireNotifyEvent(oldState, newState);
  }

  fireNotifyEvent(oldState, newState) {
    this.mainContentPanelNotify.dispatch({
      old: oldState,
      new: newState
    });

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