
import {ActiveViewController} from "./ActiveViewController";
import {RendererEventFactory} from "../RendererEventFactory";


export class SidePanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.show = true;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.PROFILE;
    this.activeSubmenuSelection = SidePanelViewController.SubmenuSelection.SPIRIT;

    this.sidePanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this);

    this.contentPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this);

    this.menuListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this);

  }

  configureContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  fireNotifyEvent() {
    this.sidePanelChangeNotifier.dispatch({});
  }

  hidePanel() {
    this.show = false;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.NONE;
    this.fireNotifyEvent()
  }

  showPanel(selection) {
    this.show = true;
    this.activeMenuSelection = selection;
    this.fireNotifyEvent()
  }

  changeActiveSubmenuPanel(submenuItem) {
    this.activeSubmenuSelection = submenuItem;
    this.fireNotifyEvent()
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
