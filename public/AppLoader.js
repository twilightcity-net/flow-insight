const { app, Tray } = require("electron"),
  log = require("electron-log"),
  platform = require("electron-platform"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  { EventManager, MainEvent } = require("./EventManager"),
  { ShortcutManager } = require("./ShortcutManager"),
  AppMenu = require("./AppMenu"),
  AppTray = require("./AppTray");

/*
 * This class is used to init the Application loading
 */
module.exports = class AppLoader {
  /*
   * called to initialize the loader
   */
  static init() {
    log.info("[AppLoader] Initialize");
    Util.setAppTray(new AppTray());
    this.loadingWindow = WindowManager.createWindowLoading();
    this.createMenu();
    this.eventTimerMs = 420;
    this.currentStage = 1;
    this.stages = {
      CONSOLE: "console",
      SHORTCUTS: "shortcuts",
      FINISHED: "finished"
    };
    this.events = {
      shown: new LoadingWindowEventShown(this),
      consoleReady: new ConsoleWindowEventReady(this),
      shortcutsCreated: new ShortcutsEventCreated(this),
      load: new AppLoaderEventLoad(this)
    };
  }

  /*
   * returns the total amount of stages to process
   */
  static getTotalStages() {
    return Object.keys(this.stages).length;
  }

  /*
   * increments the current stage count for progress bar
   */
  static incrementStage() {
    return this.currentStage++;
  }

  /*
   * Creates the app's menu for MacOS
   * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
   */
  static createMenu() {
    if (platform.isDarwin) {
      AppMenu.setApplicationMenu(new AppMenu());
    } else {
      AppMenu.setApplicationMenu(null);
    }
  }

  /*
   * creates the console window to the application
   */
  static createConsole() {
    log.info("[AppLoader] create console");
    WindowManager.createWindowConsole();
  }

  /*
   * registers global application shortcuts
   */
  static createShortcuts() {
    log.info("[AppLoader] create shortcuts");
    let promise = new Promise((resolve, reject) => resolve())
      .then(() => ShortcutManager.createGlobalShortcuts())
      .then(() => this.events.shortcutsCreated.dispatch())
      .catch(error => this.handleError(error));
  }

  /*
   * process any errors thrown by a stage in the app loader
   */
  static handleError(error) {
    log.error("[AppLoader] " + error.toString() + "\n\n" + error.stack + "\n");
  }

  /*
   * called when AppLoader is completed
   */
  static finished() {
    log.info("[AppLoader] finished");
    setTimeout(() => {
      WindowManager.closeWindow(this.loadingWindow, true);
    }, this.eventTimerMs);
  }
};

/*
 * the event that is dispatched right after the loading window is shown
 */
class LoadingWindowEventShown extends MainEvent {
  constructor(appLoader) {
    super(
      EventManager.EventTypes.WINDOW_LOADING_SHOWN,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
            load: appLoader.stages.CONSOLE,
            value: appLoader.incrementStage(),
            total: appLoader.getTotalStages(),
            label: "Feeding lemmings...",
            text: "Creating Console..."
          });
        }, appLoader.eventTimerMs);
      }
    );
    return this;
  }
}

/*
 * event that is dispatched after console window is created
 */
class ConsoleWindowEventReady extends MainEvent {
  constructor(appLoader) {
    super(
      EventManager.EventTypes.WINDOW_CONSOLE_READY,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
            load: appLoader.stages.SHORTCUTS,
            value: appLoader.incrementStage(),
            total: appLoader.getTotalStages(),
            label: "Counting schmeckles...",
            text: "Registering shortcuts..."
          });
        }, appLoader.eventTimerMs);
      }
    );
    return this;
  }
}

/*
 * event that is dispatched after shortcuts are created
 */
class ShortcutsEventCreated extends MainEvent {
  constructor(appLoader) {
    super(
      EventManager.EventTypes.SHORTCUTS_CREATED,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
            load: appLoader.stages.FINISHED,
            value: appLoader.incrementStage(),
            total: appLoader.getTotalStages(),
            label: "Matrix activated",
            text: "Ready!"
          });
        }, appLoader.eventTimerMs);
      }
    );
    return this;
  }
}

/*
 * the main app loader event that is used to process the various stages
 */
class AppLoaderEventLoad extends MainEvent {
  constructor(appLoader) {
    super(EventManager.EventTypes.APPLOADER_LOAD, appLoader, (event, arg) => {
      switch (arg.load) {
        case appLoader.stages.CONSOLE:
          appLoader.createConsole();
          break;
        case appLoader.stages.SHORTCUTS:
          appLoader.createShortcuts();
          break;
        case appLoader.stages.FINISHED:
          appLoader.finished();
          break;
        default:
          log.warn("[AppLoader] unrecognized stage : " + arg.load);
      }
    });
    return this;
  }
}
