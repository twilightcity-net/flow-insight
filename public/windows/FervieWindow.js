const { BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  isDev = require("electron-is-dev"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory"),
  {
    ShortcutManager,
    Shortcut,
  } = require("../managers/ShortcutManager");

/*
 * The fervie window contains an animated fun button that starts a pair request
 */
module.exports = class FervieWindow {
  constructor(windowName, arg) {
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.FERVIE;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view,
      arg
    );

    this.fervieHeight = 58;
    this.fervieWidth = 136;
    this.rightMargin = 20;
    this.bottomMargin = 20;

    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = true;
    this.window = new BrowserWindow({
      name: this.name,
      width: this.fervieWidth,
      height:  this.fervieHeight,
      minWidth: this.fervieWidth,
      minHeight:  this.fervieHeight,
      x: Math.floor(this.display.workArea.x + this.display.workAreaSize.width - this.fervieWidth - this.rightMargin),
      y: Math.floor(this.display.workArea.y + this.display.workAreaSize.height - this.fervieHeight - this.bottomMargin),
      resizable: false,
      hasShadow: false,
      transparent: true,
      movable: false,
      center: true,
      frame: false,
      show: false,
      icon: this.icon,
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
    this.window.setVisibleOnAllWorkspaces(true);

    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.events = {
    };

    this.isOpen = true;
  }

  onShowCb() {
    log.info("[FervieWindow] show window");
  }

  onClosedCb() {
    log.info("[FervieWindow] closed window -> enable global shortcuts");
  }


};
