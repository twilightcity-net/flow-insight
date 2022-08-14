const { BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory");

/**
 * A small floating window for registering new plugins.  Gives the user a chance
 * to authorize any new plugins found in the directory.
 */
module.exports = class PluginRegistrationWindow {
  constructor(windowName, arg) {
    this.arg = arg;
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.PLUGIN;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view,
      arg
    );
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = true;
    this.width = Math.floor(this.display.workAreaSize.width * 0.40);
    this.height = Math.floor((this.display.workAreaSize.height / 2) * 0.4);
    this.topMargin = 100;
    this.window = new BrowserWindow({
      titleBarStyle: "customButtonsOnHover",
      name: this.name,
      width: this.width,
      height: this.height,
      x: Math.floor(this.display.workAreaSize.width /2 - this.width/2),
      y: Math.floor( this.display.workAreaSize.height /4 - this.height/3),
      resizable: false,
      movable: true,
      frame: false,
      show: false,
      icon: this.icon,
      backgroundColor: "#1B1C1D",
      fullscreenable: false,
      webPreferences: {
        toolbar: false,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.window.name = this.name;
    this.window.setMenu(null);

    this.window.setAlwaysOnTop(true, "screen-saver");

    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
  }

  onShowCb() {
    log.info("[PluginRegistrationWindow] opened window");
  }

  onClosedCb() {
    log.info("[PluginRegistrationWindow] closed window");

    WindowManagerHelper.closePluginRegistrationWindow();
  }
};
