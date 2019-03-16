
import {ActiveViewController} from "./ActiveViewController";


export class SidePanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.show = true;
    this.activeMenuSelection = null;
    this.activeSubmenuSelection = null;

    this.resetDefaultVisibility();
    this.resetDefaultMenu();
    this.resetDefaultSubmenu();

  }

  hidePanel() {
    this.show = false;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.NONE;
    this.notifyRefresh()
  }

  showPanel(selection) {
    this.show = true;
    this.activeMenuSelection = selection;
    this.notifyRefresh()
  }

  changeActiveMenuItem(menuItem) {
     this.activeMenuSelection = menuItem;
     this.resetDefaultSubmenu();
    this.notifyRefresh()
  }

  changeActiveSubmenuItem(submenuItem) {
    this.activeSubmenuSelection = submenuItem;
    this.notifyRefresh()
  }

  resetDefaultVisibility() {
    this.show = true;
  }

  resetDefaultMenu() {
    this.activeMenuSelection = SidePanelViewController.MenuSelection.PROFILE;
  }

  resetDefaultSubmenu() {
    this.activeSubmenuSelection = SidePanelViewController.SubmenuSelection.SPIRIT;
  }

  static get MenuSelection() {
    return {
      PROFILE: "profile",
      MESSAGES: "messages",
      NOTIFICATIONS: "notifications",
      NONE: "none"
    };
  }

  static get SubmenuSelection() {
    return {
      SPIRIT: "spirit",
      BADGES: "badges"
    };
  }

}
