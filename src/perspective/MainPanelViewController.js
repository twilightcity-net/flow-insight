
import {ActiveViewController} from "./ActiveViewController";


export class MainPanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.activeMenuItem = "journal";
  }

  changeActiveMenuItem(menuItem) {
     this.activeMenuItem = menuItem;
  }

  static get MenuItem() {
    return {
      JOURNAL: "journal",
      TROUBLESHOOT: "troubleshoot",
      FLOW: "flow"
    };
  }
}