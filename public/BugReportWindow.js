const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  { applicationIcon } = require("./electron"),
  ViewManagerHelper = require("./ViewManagerHelper");

/*
 * Should display when the user select the Help menu's item for reporting bugs,
 */
module.exports = class BugReportWindow {
  constructor() {
    this.name = global.App.WindowManager.types.BUGREPORT;
    this.view = ViewManagerHelper.ViewNames.BUGREPORT;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.window = new BrowserWindow({
      name: this.name,
      width: 900,
      height: 680,
      show: false,
      backgroundColor: "#ffffff",
      icon: applicationIcon,
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });
    this.window.setMenu(null);
    this.autoShow = true;
  }
};
