const log = require("electron-log"),
  platform = require("electron-platform"),
  App = require("./App"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  { EventManager, MainEvent } = require("../managers/EventManager"),
  EventManagerHelper = require("../managers/EventManagerHelper"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  AppMenu = require("./AppMenu"),
  AppTray = require("./AppTray");

/*
 * This class is used to init the Application loading
 */
module.exports = class AppLoader {
  constructor() {
    log.info("[AppLoader] created : okay");
    Util.setAppTray(new AppTray());
    this.loadingWindow = WindowManagerHelper.createWindowLoading();
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
  getTotalStages() {
    return Object.keys(this.stages).length;
  }

  /*
   * increments the current stage count for progress bar
   */
  incrementStage() {
    return this.currentStage++;
  }

  /*
   * Creates the app's menu for MacOS
   * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
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
    log.info("[AppLoader] create console");
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
      ShortcutManager.createGlobalShortcuts();
      this.events.shortcutsCreated.dispatch();
    } catch (error) {
      global.App.handleError(error, true);
    }
  }

  /*
   * called when AppLoader is completed
   */
  finished() {
    log.info("[AppLoader] finished");
    setTimeout(() => {
      global.App.WindowManager.closeWindow(this.loadingWindow, true);
    }, this.eventTimerMs * 2);
  }
};

/*
 * the event that is dispatched right after the loading window is shown
 */
class LoadingWindowEventShown extends MainEvent {
  constructor(appLoader) {
    super(
      EventManagerHelper.Events.WINDOW_LOADING_SHOWN,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManagerHelper.Events.APPLOADER_LOAD, {
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
      EventManagerHelper.Events.WINDOW_CONSOLE_READY,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManagerHelper.Events.APPLOADER_LOAD, {
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
      EventManagerHelper.Events.SHORTCUTS_CREATED,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManagerHelper.Events.APPLOADER_LOAD, {
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
    super(EventManagerHelper.Events.APPLOADER_LOAD, appLoader, (event, arg) => {
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
