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
  // TODO test to see if we can use promises instead of chaning events
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

    // var p1 = new Promise((resolve, reject) => {
    //   if (true)
    //     throw new Error("rejected!");
    //   else
    //     resolve(4);
    // });
    // p1.then((val) => val + 2)
    //   .then((val) => console.log("got", val))
    //   .catch((err) => console.log("error: ", err.message));

    ShortcutManager.createGlobalShortcuts();

    this.events.shortcutsCreated.dispatch();
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

class LoadingWindowEventShown extends MainEvent {
  constructor(appLoader) {
    super(
      EventManager.EventTypes.WINDOW_LOADING_SHOWN,
      appLoader,
      (event, arg) => {
        EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
          load: appLoader.stages.CONSOLE,
          value: appLoader.incrementStage(),
          total: appLoader.getTotalStages(),
          label: "Feeding lemmings and unicorns...",
          text: "Creating Console..."
        });
      }
    );
    return this;
  }
}

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
            label: "Calculating schmeckles...",
            text: "Registering shortcuts..."
          });
        }, appLoader.eventTimerMs);
      }
    );
    return this;
  }
}

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
