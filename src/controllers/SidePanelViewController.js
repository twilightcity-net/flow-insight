import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class SidePanelViewController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    this.show = true;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.SPIRIT;
    this.activeSpiritSubmenuSelection =
      SidePanelViewController.SubmenuSelection.SPIRIT;
    this.activeTeamSubmenuSelection =
      SidePanelViewController.SubmenuSelection.TEAM;
    this.activeCircuitsSubmenuSelection =
      SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS;
    this.sidePanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );
    this.spiritPanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SPIRIT_PANEL,
      this
    );
    this.teamPanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_TEAM_PANEL,
      this
    );
    this.circuitsPanelChangeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_CIRCUITS_PANEL,
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
    this.teamPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_TEAM_PANEL,
      this
    );
    this.spiritPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_SPIRIT_PANEL,
      this
    );
    this.circuitsPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_CIRCUITS_PANEL,
      this
    );
  }

  static get MenuSelection() {
    return {
      SPIRIT: "spirit",
      MESSAGES: "messages",
      CIRCUITS: "circuits",
      NOTIFICATIONS: "notifications",
      NONE: "none"
    };
  }

  static get SubmenuSelection() {
    return {
      SPIRIT: "spirit",
      BADGES: "badges",
      TEAM: "team",
      PARTICIPATING_CIRCUITS: "my-circuits",
      DO_IT_LATER_CIRCUITS: "do-it-later-circuits"
    };
  }

  static get AnimationTypes() {
    return {
      FLY_DOWN: "fly down"
    };
  }

  static get AnimationDelays() {
    return {
      SUBMENU: 350
    };
  }

  configureSidePanelContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  configureTeamPanelListener(scope, callback) {
    this.teamPanelListener.updateCallback(scope, callback);
  }

  configureSpiritPanelListener(scope, callback) {
    this.spiritPanelListener.updateCallback(scope, callback);
  }

  configureCircuitsPanelListener(scope, callback) {
    this.circuitsPanelListener.updateCallback(scope, callback);
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

  fireTeamPanelNotifyEvent() {
    this.teamPanelChangeNotifier.dispatch({});
  }

  fireCircuitsPanelNotifyEvent() {
    this.circuitsPanelChangeNotifier.dispatch({});
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

  changeActiveSpiritSubmenuPanel(submenuItem) {
    this.activeSpiritSubmenuSelection = submenuItem;
    this.fireSpiritPanelNotifyEvent();
  }

  changeActiveTeamSubmenuPanel(submenuItem) {
    this.activeTeamSubmenuSelection = submenuItem;
    this.fireTeamPanelNotifyEvent();
  }

  changeActiveCircuitsSubmenuPanel(submenuItem) {
    this.activeCircuitsSubmenuSelection = submenuItem;
    this.fireCircuitsPanelNotifyEvent();
  }
}
