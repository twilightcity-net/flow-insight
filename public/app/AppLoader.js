const log = require("electron-log"),
  platform = require("electron-platform"),
  chalk = require("chalk"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory"),
  VolumeManager = require("../managers/VolumeManager"),
  {
    ShortcutManager,
  } = require("../managers/ShortcutManager"),
  AppError = require("./AppError"),
  AppMenu = require("./AppMenu"),
  AppTray = require("./AppTray"),
  AppLogin = require("./AppLogin");

/**
 * TODO this needs to have some type of controller class manage the events in a circuit
 */

/**
 * This class is used to init the Application loading
 * @property {loadingWindow} the window to be displayed
 * @property {eventTimerMs} the amount of milliseconds to wait between stages
 * @property {currentStage} the curren stage being processed
 * @property {stages} an enum list of stages to process
 * @property {events} the events and callbacks linked to this class
 * @type {AppLoader}
 */
module.exports = class AppLoader {
  constructor() {
    log.info("[AppLoader] created -> okay");
    this.eventTimerMs = 210;
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
        (..._) => this.onLoadingShowCb()
      ),
      login: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_LOGIN,
        this,
        (..._) => this.onLoadingLoginCb()
      ),
      loginFailed: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_LOGIN_FAILED,
        this
      ),
      talkConnected: EventFactory.createEvent(
        EventFactory.Types.TALK_CONNECTED,
        this,
        (..._) => this.onConnectedTalkCb()
      ),
      talkFailed: EventFactory.createEvent(
        EventFactory.Types.TALK_CONNECT_FAILED,
        this
      ),
      volumesReady: EventFactory.createEvent(
        EventFactory.Types.DATABASE_VOLUMES_READY,
        this,
        (..._) => this.onVolumesReady()
      ),
      consoleReady: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_READY,
        this,
        (..._) => this.onConsoleReadyCb()
      ),
      shortcutsCreated: EventFactory.createEvent(
        EventFactory.Types.SHORTCUTS_CREATED,
        this,
        (..._) => this.onShortcutsCreatedCb()
      ),
      load: EventFactory.createEvent(
        EventFactory.Types.APPLOADER_LOAD,
        this,
        (..._) => this.onLoadCb(..._)
      ),
      introEnded: EventFactory.createEvent(
        EventFactory.Types.APP_INTRO_DONE,
        this,
        (..._) => this.onIntroDone(..._)
      ),
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
    this.events.talkConnected.remove();
    this.events.talkFailed.remove();
    this.events.volumesReady.remove();
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
        text: "Logging in to twilightcity.net...",
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
        load: this.stages.TALK,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "dosing aliens...",
        text: "Connecting to Talknet...",
      });
    }, this.eventTimerMs);
  }

  /**
   * called after the app is successfully logged in
   * @param event
   * @param arg
   */
  onConnectedTalkCb(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.VOLUMES,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "breeding platypuses...",
        text: "Loading Volumes...",
      });
    }, this.eventTimerMs);
  }

  onVolumesReady(event, arg) {
    setTimeout((event, arg) => {
      this.events.load.dispatch({
        load: this.stages.CONSOLE,
        value: this.incrementStage(),
        total: this.getTotalStages(),
        label: "feeding lemmings...",
        text: "Creating Console...",
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
        text: "Registering shortcuts...",
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
        text: "Ready!",
      });
    }, this.eventTimerMs * 2);
  }

  /**
   * called when AppLoader is completed
   */
  onFinished() {
    this.isFinished = true;
    if (this.introDone) {
      this.setTimeoutToCloseWindowAndStartHeartbeat(4.2);
    }
  }

  onIntroDone = () => {
    this.introDone = true;
    if (this.isFinished) {
      this.setTimeoutToCloseWindowAndStartHeartbeat(1);
    }
  }

  setTimeoutToCloseWindowAndStartHeartbeat(factor) {
    setTimeout(() => {
      global.App.WindowManager.closeWindow(
        this.loadingWindow,
        true
      );
      this.unwireEvents();
      this.showGettingStartedWindow();
      this.showFervieWindow();

      global.App.AppHeartbeat.start();
      global.App.AppFlowPublisher.start();
      global.App.ShortcutManager.enableGlobalShortcuts();

      log.info("[AppLoader] finished loading -> okay");
    }, this.eventTimerMs * factor);
  }

  showGettingStartedWindow() {
    setTimeout( () => {
      try {
        WindowManagerHelper.createGettingStartedWindow();
      } catch (error) {
        AppError.handleError(error, true);
      }
    }, 333);
  }

  showFervieWindow() {
    setTimeout( () => {
      try {
        WindowManagerHelper.createFervieWindow();
      } catch (error) {
        AppError.handleError(error, true);
      }
    }, 555);
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
      case this.stages.TALK:
        this.connectToTalknet();
        break;
      case this.stages.VOLUMES:
        this.initVolumes();
        break;
      case this.stages.CONSOLE:
        this.createConsole();
        break;
      case this.stages.SHORTCUTS:
        this.createShortcuts();
        break;
      case this.stages.FINISHED:
        this.onFinished();
        break;
      default:
        log.warn(
          "[AppLoader] unrecognized stage : " + arg.load
        );
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
      TALK: "talk",
      VOLUMES: "volumes",
      CONSOLE: "console",
      SHORTCUTS: "shortcuts",
      FINISHED: "finished",
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
    AppLogin.doLogin((store) => {
      let status = AppLogin.getConnectionStatus();
      if (status.isValid()) {
        log.info(
          "[AppLoader] login -> " +
            chalk.bgGreen.bold("VALID") +
            " : " +
            JSON.stringify(status)
        );
        global.App.isOnline = true;
        global.App.isLoggedIn = true;
        global.App.connectionStatus = status;
        this.events.login.dispatch(status);
      } else {
        log.info(
          "[AppLoader] login FAILED : " +
            JSON.stringify(status)
        );
        this.events.loginFailed.dispatch(status);
      }
    });
  }

  /**
   * connect to talknet service
   */
  connectToTalknet() {
    log.info("[AppLoader] connect to talknet server");
    try {
      global.App.TalkManager.createConnection();
    } catch (error) {
      AppError.handleError(error, true);
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
      AppError.handleError(error, true);
    }
  }

  /**
   * registers global application shortcuts
   */
  createShortcuts() {
    log.info("[AppLoader] init shortcuts");
    try {
      global.App.ShortcutManager.initGlobalShortcuts();
      this.events.shortcutsCreated.dispatch({});
    } catch (error) {
      AppError.handleError(error, true);
    }
  }

  /**
   * builds our data warehouse to put store our in memory databases in
   */
  initVolumes() {
    log.info("[AppLoader] create volumes");
    try {
      global.App.VolumeManager.init();
    } catch (error) {
      AppError.handleError(error, true);
    }
  }
};
