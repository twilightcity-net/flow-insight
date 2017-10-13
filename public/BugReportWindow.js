const { BrowserWindow } = require("electron");
const isDev = require("electron-is-dev");
const { applicationIcon } = require("./electron");
const ViewManagerHelper = require("./ViewManagerHelper");

/*
 * Should display when the user select the Help menu's item for reporting bugs,
 */
module.exports = class BugReportWindow {
  constructor(WindowManager) {
    // window and view properties
    this.manager = WindowManager;
    this.name = WindowManager.WindowNames.BUGREPORT;
    this.view = ViewManagerHelper.ViewNames.BUGREPORT;
    this.url = WindowManager.getWindowViewURL(this.view);

    // the main window for view content
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

    // do not show a menu
    this.window.setMenu(null);
  }
};
