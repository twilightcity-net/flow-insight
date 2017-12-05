const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

/*
 * Should display when the user select the Help menu's item for reporting bugs,
 */
module.exports = class BugReportWindow {
  constructor() {
    this.name = WindowManagerHelper.WindowNames.BUGREPORT;
    this.view = ViewManagerHelper.ViewNames.BUGREPORT;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.icon = Util.getAppIcon("icon.ico");
    this.window = new BrowserWindow({
      name: this.name,
      width: 900,
      height: 620,
      show: false,
      backgroundColor: "#ffffff",
      icon: this.icon,
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });
    this.window.name = this.name;
    this.window.setMenu(null);
    this.autoShow = true;
  }
};
