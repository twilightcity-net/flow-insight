const { app, Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
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
    WindowManager.createWindowLoading();
    this.createTray();
    this.createMenu();
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
};
