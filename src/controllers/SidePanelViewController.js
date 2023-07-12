import { ActiveViewController } from "./ActiveViewController";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { CircuitClient } from "../clients/CircuitClient";
import FeatureToggle from "../layout/shared/FeatureToggle";

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
    this.activeMenuSelection = SidePanelViewController.getDefaultMenuSelection();
    this.activeFervieSubmenuSelection = SidePanelViewController.SubmenuSelection.FERVIE;
    this.activeCircuitsSubmenuSelection = SidePanelViewController.SubmenuSelection.RETRO;
    this.activeNotificationsSubmenuSelection = SidePanelViewController.SubmenuSelection.NOTIFICATIONS;
    this.activeDashboardSubmenuSelection = SidePanelViewController.SubmenuSelection.DASHBOARD;
    this.circuitStartStopListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_START_STOP,
        this
      );
    this.sidePanelChangeNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_SIDEBAR_PANEL,
        this
      );
    this.ferviePanelChangeNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_FERVIE_PANEL,
        this
      );
    this.teamPanelChangeNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_TEAM_PANEL,
        this
      );
    this.circuitsPanelChangeNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUITS_PANEL,
        this
      );
    this.contentPanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_SIDEBAR_PANEL,
        this
      );
    this.menuListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_SIDEBAR_PANEL,
      this
    );
    this.perspectiveControllerListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_SIDEBAR_PANEL,
        this
      );
    this.homePanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_TEAM_PANEL,
        this
      );
    this.ferviePanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_FERVIE_PANEL,
        this
      );
    this.circuitsPanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUITS_PANEL,
        this
      );
    this.notificationsPanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_NOTIFICATIONS_PANEL,
        this
      );
    this.dashboardPanelListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_DASHBOARD_PANEL,
        this
      );

    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
    this.heartbeatListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.APP_HEARTBEAT,
        this
      );
    this.pulseListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.APP_PULSE,
      this
    );
    this.sidebarShowListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW,
        this
      );
  }

  static getDefaultMenuSelection() {
    if (FeatureToggle.isMoovieApp) {
      return SidePanelViewController.MenuSelection.BUDDIES;
    } else if (FeatureToggle.isFerviePopupEnabled) {
      return SidePanelViewController.MenuSelection.FERVIE;
    } else {
      return SidePanelViewController.MenuSelection.HOME;
    }
  }

  /**
   * enum list of the possible menu types of the console sidebar
   * @constructor
   */
  static get MenuSelection() {
    return {
      WTF: "wtf",
      FERVIE: "fervie",
      HOME: "home",
      BUDDIES: "buddies",
      CIRCUITS: "circuits",
      NOTIFICATIONS: "notifications",
      DASHBOARD: "dashboard",
      NONE: "none",
    };
  }

  /**
   * enum list of the possible sub menu types of the console sidebar
   * @constructor
   */
  static get SubmenuSelection() {
    return {
      FERVIE: "fervie",
      BADGES: "badges",
      SKILLS: "skills",
      ROLES: "roles",
      ACCESSORIES: "accessories",
      TEAMS: "teams",
      BUDDIES: "buddies",
      ACTIVE: "active",
      DO_IT_LATER: "do-it-later",
      RETRO: "retro",
      NOTIFICATIONS: "notifications",
      DASHBOARD: "dashboard",
      ACCOUNT: "account",
      ME: "me"
    };
  }

  /**
   * enum list of the possible animation types
   * @constructor
   */
  static get AnimationTypes() {
    return {
      FLY_DOWN: "fade down",
      FADE_IN: "fade right",
      SLIDE_DOWN: "slide down",
      SLIDE_IN: "slide left",
    };
  }

  /**
   * enum list of the animation delays
   * @returns {{SUBMENU: number}}
   * @constructor
   */
  static get AnimationDelays() {
    return {
      SUBMENU: 350,
    };
  }

  /**
   * configure side panel listener. called when the console content is changed
   * @param scope
   * @param callback
   */
  configureSidePanelContentListener(scope, callback) {
    this.contentPanelListener.updateCallback(
      scope,
      callback
    );
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
  configureHomePanelListener(scope, callback) {
    this.homePanelListener.updateCallback(scope, callback);
  }

  /**
   * menu listener for the fervie panel
   * @param scope
   * @param callback
   */
  configureFerviePanelListener(scope, callback) {
    this.ferviePanelListener.updateCallback(
      scope,
      callback
    );
  }

  /**
   * menu listener for the circuits panel
   * @param scope
   * @param callback
   */
  configureCircuitsPanelListener(scope, callback) {
    this.circuitsPanelListener.updateCallback(
      scope,
      callback
    );
  }

  /**
   * menu listener for the notifications panel
   * @param scope
   * @param callback
   */
  configureNotificationsPanelListener(scope, callback) {
    this.notificationsPanelListener.updateCallback(
      scope,
      callback
    );
  }

  /**
   * menu listener for the dashboard panel
   * @param scope
   * @param callback
   */
  configureDashboardPanelListener(scope, callback) {
    this.dashboardPanelListener.updateCallback(
      scope,
      callback
    );
  }

  configureHeartbeatListener(scope, callback) {
    this.heartbeatListener.updateCallback(scope, callback);
  }

  configurePulseListener(scope, callback) {
    this.pulseListener.updateCallback(scope, callback);
  }

  configureSidebarShowListener(scope, callback) {
    this.sidebarShowListener.updateCallback(
      scope,
      callback
    );
  }

  /**
   * clears our heartbeat listener. This is used to update the connection
   * icon in the bottom of the left console side menu.
   */
  clearHeartbeatListener() {
    this.heartbeatListener.clear();
  }

  /**
   * clears our menu listener which is used to handle the menu change
   * selections of user interactions.
   */
  clearMenuListener() {
    this.menuListener.clear();
  }

  /**
   * removes our pulse listener from memory.
   */
  clearPulseListener() {
    this.pulseListener.clear();
  }
  /**
   * clears our sidebar show listener. This is used to show and hide the
   * console on the left.
   */
  clearSidebarShowListener() {
    this.sidebarShowListener.clear();
  }

  /**
   * dispatch an event when the console sidebar panel changes
   */
  fireSidePanelNotifyEvent() {
    this.sidePanelChangeNotifier.dispatch({});
  }

  /**
   * dispatch an event when the fervie panel content changes
   */
  fireFerviePanelNotifyEvent() {
    this.ferviePanelChangeNotifier.dispatch({});
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
   * hides the console sidebar panel
   */
  hidePanel() {
    this.show = false;
    this.activeMenuSelection =
      SidePanelViewController.MenuSelection.NONE;
    this.fireSidePanelNotifyEvent();
  }

  /**
   * starts a new WTF session with gridtime
   */
  startWTF() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.COMMAND,
      BrowserRequestFactory.Commands.WTF
    );
    this.makeSidebarBrowserRequest(request);
  }

  /**
   * Load the default flow panel
   */
  loadDefaultFlowPanel() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.FLOW,
      0
    );
    this.makeSidebarBrowserRequest(request);
  }

  /**
   * Load the default control panel
   */
  loadDefaultControlPanel() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.CONTROL,
      0
    );
    this.makeSidebarBrowserRequest(request);
  }

  /**
   * Load the default journal panel
   */
  loadDefaultJournalPanel() {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.JOURNAL,
      "me"
    );
    this.makeSidebarBrowserRequest(request);
  }

  /**
   * loads your active WTF that is in the active session from gridtime
   */
  loadWTF() {
    CircuitClient.getActiveCircuit(this, (arg) => {
      let circuit = arg.data[0];
      if (circuit) {
        let circuitName = circuit.circuitName,
          request = BrowserRequestFactory.createRequest(
            BrowserRequestFactory.Requests.CIRCUIT,
            circuitName
          );

        this.makeSidebarBrowserRequest(request);
      }
    });
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
   * function called when we wish to change the content of the fervie panel
   * @param submenuItem
   */
  changeActiveFervieSubmenuPanel(submenuItem) {
    this.activeFervieSubmenuSelection = submenuItem;
    this.fireFerviePanelNotifyEvent();
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
