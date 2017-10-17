const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  log = require("electron-log");

/*
 * The Application loading window. Loads LoadingView class. This window
 * is always show when the application first loads
 */
module.exports = class LoadingWindow {
  constructor(WindowManager) {
    this.manager = WindowManager;
    this.name = WindowManager.WindowNames.LOADING;
    this.view = ViewManagerHelper.ViewNames.LOADING;
    this.url = WindowManager.getWindowViewURL(this.view);

    // creates the BrowserWindow with View Content
    this.window = new BrowserWindow({
      name: this.name,
      width: 360,
      height: 160,
      minWidth: 360,
      minHeight: 160,
      resizable: false,
      show: false,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });

    // dont show a menu
    this.window.setMenu(null);
  }
};
