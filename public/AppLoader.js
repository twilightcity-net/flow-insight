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
};

class LoadingWindowEventShown extends MainEvent {
  constructor(clazz) {
    super(EventManager.EventTypes.WINDOW_LOADING_SHOWN, clazz, (event, arg) => {
      setTimeout(() => {
        EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, {
          load: "console",
          value: 1,
          total: 3,
          label: "Feeding lemmings and unicorns...",
          text: "Creating Console..."
        });
      }, 500);
    });
    return this;
  }
}

class AppLoaderEventLoad extends MainEvent {
  constructor(appLoader) {
    super(EventManager.EventTypes.APPLOADER_LOAD, appLoader, (event, arg) => {
      if (arg.load === "console") {
        appLoader.createConsole();
      }
    });
    return this;
  }
}
