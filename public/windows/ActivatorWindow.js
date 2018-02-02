const { BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

/*
 * The Application loading window. Loads LoadingView class. This window
 * is always show when the application first loads
 */
module.exports = class ActivatorWindow {
  constructor() {
    this.name = WindowManagerHelper.WindowNames.ACTIVATOR;
    this.view = ViewManagerHelper.ViewNames.ACTIVATOR;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.icon = Util.getAppIcon("icon.ico");
    this.autoShow = true;
    this.window = new BrowserWindow({
      name: this.name,
      width: 600,
      height: 350,
      minWidth: 600,
      minHeight: 350,
      resizable: false,
      movable: true,
      center: true,
      frame: true,
      show: false,
      icon: this.icon,
      backgroundColor: "#000000",
      fullscreenable: false,
      webPreferences: { toolbar: false }
    });
    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("closed", () => this.onClosedCb());
  }

  onClosedCb() {
    log.info("[ActivatorWindow] closed window -> quit application");
    global.App.quit();
  }
};
