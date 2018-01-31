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
      width: 420,
      height: 210,
      minWidth: 420,
      minHeight: 210,
      resizable: false,
      movable: true,
      center: true,
      frame: false,
      show: true,
      icon: this.icon,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: { toolbar: false }
    });
    this.window.name = this.name;
    this.window.setMenu(null);
  }
};
