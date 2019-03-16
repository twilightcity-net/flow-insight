
import {ActiveViewController} from "./ActiveViewController";


export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.oldMenuSelection = null;
    this.activeMenuSelection = null;

    this.resetDefaultMenuSelection();
  }

  changeActivePanel(oldState, newState) {
     this.oldMenuSelection = oldState;
     this.activeMenuSelection = newState;
    this.notifyRefresh()
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