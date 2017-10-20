const { app, Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  { EventManager, MainEvent } = require("./EventManager"),
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
    this.events = {
      shown: new LoadingWindowEventShown(this),
      consoleReady: new ConsoleWindowEventReady(this),
      load: new AppLoaderEventLoad(this)
    };
  }

  /*
   * Creates the app's menu for MacOS
   * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
   */
  static createMenu() {
    if (process.platform === "darwin") {
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
  static registerShortcuts() {
    log.info("[AppLoader] register shortcuts");

    // TODO implement shortcut registry
  }
};

class LoadingWindowEventShown extends MainEvent {
  constructor(appLoader) {
    super(
      EventManager.EventTypes.WINDOW_LOADING_SHOWN,
      appLoader,
      (event, arg) => {
        setTimeout(() => {
          EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
            load: "console",
            value: 1,
            total: 3,
            label: "Feeding lemmings and unicorns...",
            text: "Creating Console..."
          });
        }, 300);
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
            load: "shortcuts",
            value: 2,
            total: 3,
            label: "Calculating schmeckles ...",
            text: "Registering shortcuts..."
          });
        }, 200);
      }
    );
    return this;
  }
}

class AppLoaderEventLoad extends MainEvent {
  constructor(appLoader) {
    super(EventManager.EventTypes.APPLOADER_LOAD, appLoader, (event, arg) => {
      if (arg.load === "console") {
        appLoader.createConsole();
      } else if (arg.load === "shortcuts") {
        appLoader.registerShortcuts();
      }
    });
    return this;
  }
}
