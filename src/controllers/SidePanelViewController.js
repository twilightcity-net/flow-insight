import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { BrowserRequestFactory } from "./BrowserRequestFactory";

/**
 * control the sidebar panels
 */
export class SidePanelViewController extends ActiveViewController {
  /**
   * string hardcode for id
   * @returns {string}
   */
  static get ID() {
    return "id";
  }

  /**
   * string hardcode for self
   * @returns {string}
   */
  static get ME() {
    return "Me";
  }
  /**
   * builds the sidebar controller. sets default values and menu selections. this
   * also configures the listeners
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.show = true;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.TEAM;
    this.activeSpiritSubmenuSelection =
      SidePanelViewController.SubmenuSelection.SPIRIT;
    this.activeTeamSubmenuSelection =
      SidePanelViewController.SubmenuSelection.TEAM;
    this.activeCircuitsSubmenuSelection =
      SidePanelViewController.SubmenuSelection.PARTICIPATING_CIRCUITS;
    this.activeNotificationsSubmenuSelection =
      SidePanelViewController.SubmenuSelection.NOTIFICATIONS;
    this.circuitStartStopListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_CIRCUIT_START_STOP,
      this
    );
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
    this.notificationsPanelListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_NOTIFICATIONS_PANEL,
      this
    );
    this.browserController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.LAYOUT_BROWSER,
      this
    );
    this.heartbeatListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.APP_HEARTBEAT,
      this
    );
    this.pulseListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.APP_PULSE,
      this
    );
    this.sidebarShowListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW,
      this
    );
  }

  /**
   * enum list of the possible menu types of the console sidebar
   * @returns {{CIRCUITS: string, TEAM: string, SPIRIT: string, NOTIFICATIONS: string, NONE: string}}
   * @constructor
   */
  static get MenuSelection() {
    return {
      WTF: "wtf",
      SPIRIT: "spirit",
      TEAM: "team",
      CIRCUITS: "circuits",
      NOTIFICATIONS: "notifications",
      NONE: "none"
    };
  }

  /**
   * enum list of the possible sub menu types of the console sidebar
   * @returns {{BADGES: string, DO_IT_LATER_CIRCUITS: string, PARTICIPATING_CIRCUITS: string, SPIRIT: string, TEAM: string}}
   * @constructor
   */
  static get SubmenuSelection() {
    return {
      SPIRIT: "spirit",
      BADGES: "badges",
      TEAM: "team",
      PARTICIPATING_CIRCUITS: "my-circuits",
      DO_IT_LATER_CIRCUITS: "do-it-later-circuits",
      NOTIFICATIONS: "notifications"
    };
  }

  /**
   * enum list of the possible animation types
   * @returns {{FLY_DOWN: string}}
   * @constructor
   */
  static get AnimationTypes() {
    return {
      FLY_DOWN: "fade down"
    };
  }

  /**
   * enum list of the animation delays
   * @returns {{SUBMENU: number}}
   * @constructor
   */
  static get AnimationDelays() {
    return {
      SUBMENU: 350
    };
  }

  /**
   * configure side panel listener. called when the console content is changed
   * @param scope
   * @param callback
   */
  configureSidePanelContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the console view
   * @param scope
   * @param callback
   */
  configureMenuListener(scope, callback) {
    this.menuListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the team panel
   * @param scope
   * @param callback
   */
  configureTeamPanelListener(scope, callback) {
    this.teamPanelListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the spirit panel
   * @param scope
   * @param callback
   */
  configureSpiritPanelListener(scope, callback) {
    this.spiritPanelListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the circuits panel
   * @param scope
   * @param callback
   */
  configureCircuitsPanelListener(scope, callback) {
    this.circuitsPanelListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the notifications panel
   * @param scope
   * @param callback
   */
  configureNotificationsPanelListener(scope, callback) {
    this.notificationsPanelListener.updateCallback(scope, callback);
  }

  /**
   * perspective controller listener which is notified when the console content
   * changes
   * @param scope
   * @param callback
   */
  configurePerspectiveControllerListener(scope, callback) {
    this.perspectiveControllerListener.updateCallback(scope, callback);
  }

  configureHeartbeatListener(scope, callback) {
    this.heartbeatListener.updateCallback(scope, callback);
  }

  configurePulseListener(scope, callback) {
    this.pulseListener.updateCallback(scope, callback);
  }

  configureSidebarShowListener(scope, callback) {
    this.sidebarShowListener.updateCallback(scope, callback);
  }

  /**
   * dispatch an event when the console sidebar panel changes
   */
  fireSidePanelNotifyEvent() {
    this.sidePanelChangeNotifier.dispatch({});
  }

  /**
   * dispatch an event when the spirit panel content changes
   */
  fireSpiritPanelNotifyEvent() {
    this.spiritPanelChangeNotifier.dispatch({});
  }

  /**
   * dispatch an event when the team panel content changes
   */
  fireTeamPanelNotifyEvent() {
    this.teamPanelChangeNotifier.dispatch({});
  }

  /**
   * dispatch and event when the circuits panel content changes
   */
  fireCircuitsPanelNotifyEvent() {
    this.circuitsPanelChangeNotifier.dispatch({});
  }

  /**
   * returns true if the console sidebar is showing
   * @returns {boolean}
   */
  isVisible() {
    return this.show;
  }

  /**
   * hides the console sidebar panel
   */
  hidePanel() {
    this.show = false;
    this.activeMenuSelection = SidePanelViewController.MenuSelection.NONE;
    this.fireSidePanelNotifyEvent();
  }

  startWTF() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.COMMAND,
      BrowserRequestFactory.Commands.WTF
    );
    this.makeSidebarBrowserRequest(request);
  }

  /**
   * shows the console sidebar panel
   * @param selection
   */
  showPanel(selection) {
    this.show = true;
    this.activeMenuSelection = selection;
    this.fireSidePanelNotifyEvent();
  }

  /**
   * helper function to wrap our function from our other controller
   * @param request - {BrowserRequestFactory} type request
   */
  makeSidebarBrowserRequest(request) {
    this.browserController.makeRequest(request);
  }

  /**
   * function called when we wish to change the content of the spirit panel
   * @param submenuItem
   */
  changeActiveSpiritSubmenuPanel(submenuItem) {
    this.activeSpiritSubmenuSelection = submenuItem;
    this.fireSpiritPanelNotifyEvent();
  }

  /**
   * function called when we wish to change the content of the team panel
   * @param submenuItem
   */
  changeActiveTeamSubmenuPanel(submenuItem) {
    this.activeTeamSubmenuSelection = submenuItem;
    this.fireTeamPanelNotifyEvent();
  }

  /**
   * function called when we wish to change the content of the circuits panel
   * @param submenuItem
   */
  changeActiveCircuitsSubmenuPanel(submenuItem) {
    this.activeCircuitsSubmenuSelection = submenuItem;
    this.fireCircuitsPanelNotifyEvent();
  }
}
