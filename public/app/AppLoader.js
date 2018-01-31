const log = require("electron-log"),
  platform = require("electron-platform"),
  App = require("./App"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  AppMenu = require("./AppMenu"),
  AppTray = require("./AppTray");

/*
 * This class is used to init the Application loading
 * @property {loadingWindow} the window to be displayed
 * @property {eventTimerMs} the amount of milliseconds to wait between stages
 * @property {currentStage} the curren stage being processed
 * @property {stages} an enum list of stages to process
 * @property {events} the events and callbacks linked to this class
 */
module.exports = class AppLoader {
  constructor() {
    log.info("[AppLoader] created -> okay");
    this.eventTimerMs = 250;
    this.currentStage = 1;
    this.stages = this.getStages();
    this.events = {
      shown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_SHOWN,
        this,
        (event, arg) => this.onLoadingShowCb()
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

  /// starts the app loader
  load() {
    log.info("[AppLoader] start loading...");
    Util.setAppTray(new AppTray());
    this.loadingWindow = WindowManagerHelper.createWindowLoading();
    this.createMenu();
  }

  /*
   * the event callback that is dispatched right after the loading window is shown
   * @param {event} the event that was fired 
   * @param {arg} the argument parameters to be pass with callback
   */
  onLoadingShowCb(event, arg) {
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

  /*
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

  /*
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
    }, this.eventTimerMs * 2);
  }

  /*
   * the main app loader event callback that is used to process the various stages
   * @param {event} the event that was fired 
   * @param {arg} the argument parameters to be pass with callback
   */
  onLoadCb(event, arg) {
    switch (arg.load) {
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

  /*
   * the string enum object of stage names to process
   * @return {enum} array of stage name strings 
   */
  getStages() {
    return {
      CONSOLE: "console",
      SHORTCUTS: "shortcuts",
      FINISHED: "finished"
    };
  }

  /*
   * returns the total amount of stages to process
   * @return {int} the integer representing the total stages to process
   */
  getTotalStages() {
    return Object.keys(this.stages).length;
  }

  /*
   * increments the current stage count for progress bar
   * @return {int} the integer representing the current stage being processed
   */
  incrementStage() {
    return this.currentStage++;
  }

  /*
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

  /*
   * creates the console window to the application
   */
  createConsole() {
    log.info("[AppLoader] create console window");
    try {
      WindowManagerHelper.createWindowConsole();
    } catch (error) {
      global.App.handleError(error, true);
    }
  }

  /*
   * registers global application shortcuts
   */
  createShortcuts() {
    log.info("[AppLoader] create shortcuts");
    try {
      global.App.Shortcuts = ShortcutManager.createGlobalShortcuts();
      this.events.shortcutsCreated.dispatch();
    } catch (error) {
      global.App.handleError(error, true);
    }
  }

  /*
   * called when AppLoader is completed
   */
  finished() {
    log.info("[AppLoader] finished : okay");
    setTimeout(() => {
      global.App.WindowManager.closeWindow(this.loadingWindow, true);
      console.log(global.App.ApiKey);
    }, this.eventTimerMs * 2);
  }
};
