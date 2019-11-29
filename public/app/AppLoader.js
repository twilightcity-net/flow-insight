const log = require("electron-log"),
  platform = require("electron-platform"),
  App = require("./App"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  AppMenu = require("./AppMenu"),
  AppTray = require("./AppTray"),
  AppLogin = require("./AppLogin");

/**
 * TODO this needs to have some type of controller class manage the events in a circuit
 */

/**
 * This class is used to init the Application loading
 *
 * @property {loadingWindow} the window to be displayed
 * @property {eventTimerMs} the amount of milliseconds to wait between stages
 * @property {currentStage} the curren stage being processed
 * @property {stages} an enum list of stages to process
 * @property {events} the events and callbacks linked to this class
 */
module.exports = class AppLoader {
  constructor() {
    log.info("[AppLoader] created -> okay");
    this.eventTimerMs = 500;
    this.currentStage = 1;
    this.stages = this.getStages();
    this.wireUpEvents();
  }

  /**
   * wires up the event listeners into a circuit. really rough mimic of the front end
   * circuit for listeners
   */
  wireUpEvents() {
    log.info("[AppLoader] wiring events into hive...");
    this.events = {
      shown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_SHOWN,
        this,
        (event, arg) => this.onLoadingShowCb()
      ),
      login: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_LOGIN,
        this,
        (event, arg) => this.onLoadingLoginCb()
      ),
      loginFailed: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_LOGIN_FAILED,
        this
      ),
      rtConnected: EventFactory.createEvent(
        EventFactory.Types.WINDOW_RT_FLOW_CONNECTED,
        this,
        (event, arg) => this.onConnectedRTFlowCb()
      ),
      consoleReady: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_READY,
        this,
        (event, arg) => this.onConsoleReadyCb()
      ),
      shortcutsCreated: EventFactory.createEvent(
        EventFactory.Types.SHORTCUTS_CREATED,
        this,
        (event, arg) => this.onShortcutsCreatedCb()
      ),
      load: EventFactory.createEvent(
        EventFactory.Types.APPLOADER_LOAD,
        this,
        (event, arg) => this.onLoadCb(event, arg)
      )
    };
  }

  /**
   * This removed the event listeners from the hive. This should be called after the
   * AppLoader window is completed and app is loaded. Not the best but better.
   */
  unwireEvents() {
    log.info("[AppLoader] unwiring events from hive...");
    this.events.shown.remove();
    this.events.login.remove();
    this.events.loginFailed.remove();
    this.events.rtConnected.remove();
    this.events.consoleReady.remove();
    this.events.shortcutsCreated.remove();
    this.events.load.remove();
  }

  /**
   * starts the app loader
   */
  load() {
    log.info("[AppLoader] start loading...");
    Util.setAppTray(new AppTray());
    this.loadingWindow = WindowManagerHelper.createWindowLoading();
    this.createMenu();
  }

  /**
   * the event callback that is dispatched right after the loading window is shown
   * @param {event} the event that was fired
   * @param {arg} the argument parameters to be pass with callback
   */
  onLoadingShowCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.LOGIN,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "talking to llamas...",
        text: "Torchie Login..."
      });
    }, this.eventTimerMs);
  }

  /**
   * called after loading window is shown.
   * @param event
   * @param arg
   */
  onLoadingLoginCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.RTFLOW,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "dosing aliens...",
        text: "Connection to RealTime Flow..."
      });
    }, this.eventTimerMs);
  }

  /**
   * called after the app is successfully logged in
   * @param event
   * @param arg
   */
  onConnectedRTFlowCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.CONSOLE,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "feeding lemmings...",
        text: "Creating Console..."
      });
    }, this.eventTimerMs);
  }

  /**
   * event callback that is dispatched after console window is created
   * @param {event} the event that was fired
   * @param {arg} the argument parameters to be pass with callback
   */
  onConsoleReadyCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.SHORTCUTS,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "counting schmeckles...",
        text: "Registering shortcuts..."
      });
    }, this.eventTimerMs);
  }

  /**
   * event callback that is dispatched after shortcuts are created
   * @param {event} the event that was fired
   * @param {arg} the argument parameters to be pass with callback
   */
  onShortcutsCreatedCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.FINISHED,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "matrix activated",
        text: "Ready!"
      });
    }, this.eventTimerMs);
  }

  /**
   * the main app loader event callback that is used to process the various stages
   * @param {event} the event that was fired
   * @param {arg} the argument parameters to be pass with callback
   */
  onLoadCb(event, arg) {
    switch (arg.load) {
      case this.stages.LOGIN:
        this.processLogin();
        break;
      case this.stages.RTFLOW:
        this.connectRTFlow();
        break;
      case this.stages.CONSOLE:
        this.createConsole();
        break;
      case this.stages.SHORTCUTS:
        this.createShortcuts();
        break;
      case this.stages.FINISHED:
        this.finished();
        break;
      default:
        log.warn("[AppLoader] unrecognized stage : " + arg.load);
        break;
    }
  }

  /**
   * the string enum object of stage names to process
   * @return {enum} array of stage name strings
   */
  getStages() {
    return {
      LOGIN: "login",
      RTFLOW: "rtflow",
      CONSOLE: "console",
      SHORTCUTS: "shortcuts",
      FINISHED: "finished"
    };
  }

  /**
   * returns the total amount of stages to process
   * @return {int} the integer representing the total stages to process
   */
  getTotalStages() {
    return Object.keys(this.stages).length;
  }

  /**
   * increments the current stage count for progress bar
   * @return {int} the integer representing the current stage being processed
   */
  incrementStage() {
    return this.currentStage++;
  }

  /**
   * Creates the app's menu for MacOS
   * @ref {https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu}
   */
  createMenu() {
    if (platform.isDarwin) {
      AppMenu.setApplicationMenu(new AppMenu());
    } else {
      AppMenu.setApplicationMenu(null);
    }
  }

  /**
   * called from the laod event for login
   */
  processLogin() {
    log.info("[AppLoader] process login");
    AppLogin.doLogin(store => {
      let connectionStatus = AppLogin.getConnectionStatus();
      console.log(connectionStatus);
      if (connectionStatus.isValid()) {
        log.info("[AppLoader] valid login -> dispatch next load event");
        global.App.isOnline = true;
        global.App.isLoggedIn = true;
        global.App.connectionStatus = connectionStatus;
        this.events.login.dispatch();
      } else {
        log.info("[AppLoader] failed login -> dispatch status to login event");
        this.events.loginFailed.dispatch(store.data);
      }
    });
  }

  /**
   * connect the Rt-Flow server
   */
  connectRTFlow() {
    log.info("[AppLoader] connect rt-flow server");
    try {
      global.App.RTFlowManager.createConnection();
    } catch (error) {
      App.handleError(error, true);
    }
  }

  /**
   * creates the console window to the application
   */
  createConsole() {
    log.info("[AppLoader] create console window");
    try {
      WindowManagerHelper.createWindowConsole();
    } catch (error) {
      App.handleError(error, true);
    }
  }

  /**
   * registers global application shortcuts
   */
  createShortcuts() {
    log.info("[AppLoader] create shortcuts");
    try {
      global.App.Shortcuts = ShortcutManager.createGlobalShortcuts();
      this.events.shortcutsCreated.dispatch();
    } catch (error) {
      App.handleError(error, true);
    }
  }

  /**
   * called when AppLoader is completed
   */
  finished() {
    log.info("[AppLoader] finished : okay");
    setTimeout(() => {
      global.App.WindowManager.closeWindow(this.loadingWindow, true);
      this.unwireEvents();
      global.App.AppHeartbeat.start();
      log.info("[AppLoader] finished : done");
    }, this.eventTimerMs * 2);
  }
};
