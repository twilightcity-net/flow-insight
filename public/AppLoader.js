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
    this.loadingWindow = WindowManager.createWindowLoading();
    this.events = {
      shown: new LoadingWindowEventShown(this),
      load: new AppLoaderEventLoad(this)
    };

    // move to callbacks
    this.createTray();
    this.createMenu();
    this.createConsole();
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
   * Creates the system tray object and icon.
   */
  static createTray() {
    Util.setAppTray(new AppTray());
  }

  /*
   * creates the console window to the application
   */
  static createConsole() {
    log.info("[AppLoader] create console");
  }
};

class LoadingWindowEventShown extends MainEvent {
  constructor(clazz) {
    super(EventManager.EventTypes.WINDOW_LOADING_SHOWN, clazz, (event, arg) => {
      log.info(">>>loading shown event");
      EventManager.dispatch(EventManager.EventTypes.APPLOADER_LOAD, 0);
      return 0;
    });
    return this;
  }
}

class AppLoaderEventLoad extends MainEvent {
  constructor(clazz) {
    super(EventManager.EventTypes.APPLOADER_LOAD, clazz, (event, arg) => {
      log.info(">>>loading load event");
      return 0;
    });
    return this;
  }
}
