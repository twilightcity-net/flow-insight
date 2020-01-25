import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class SidePanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);

    this.show = true;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.PROFILE;
    this.activeSubmenuSelection =
      SidePanelViewController.SubmenuSelection.SPIRIT;

    this.sidePanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );

    this.spiritPanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SPIRIT_PANEL,
      this
    );

    this.contentPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );

    this.menuListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );

    this.perspectiveControllerListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );

    this.spiritPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SPIRIT_PANEL,
      this
    );
  }

  configureSidePanelContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  configureSpiritPanelListener(scope, callback) {
    this.spiritPanelListener.updateCallback(scope, callback);
  }

  configurePerspectiveControllerListener(scope, callback) {
    this.perspectiveControllerListener.updateCallback(scope, callback);
  }

  fireSidePanelNotifyEvent() {
    this.sidePanelChangeNotifier.dispatch({});
  }

  fireSpiritPanelNotifyEvent() {
    this.spiritPanelChangeNotifier.dispatch({});
  }

  isVisible() {
    return this.show;
  }

  hidePanel() {
    this.show = false;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.NONE;
    this.fireSidePanelNotifyEvent();
  }

  showPanel(selection) {
    this.show = true;
    this.activeMenuSelection = selection;
    this.fireSidePanelNotifyEvent();
  }

  changeActiveSubmenuPanel(submenuItem) {
    this.activeSubmenuSelection = submenuItem;
    this.fireSpiritPanelNotifyEvent();
  }

  static get MenuSelection() {
    return {
      PROFILE: "profile",
      MESSAGES: "messages",
      CIRCUITS: "circuits",
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
