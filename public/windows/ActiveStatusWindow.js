const { BrowserWindow, app} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory");
const AppFeatureToggle = require("../app/AppFeatureToggle");

/**
 * A floating active status window. Draggable around the screen, and detached from the console.
 * Appears when the console is closed to show the active status.
 */
module.exports = class ActiveStatusWindow {
  constructor(windowName, arg) {
    this.arg = arg;
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.STATUS;
    this.url = global.App.WindowManager.getWindowViewURL(this.view, arg);
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = false;
    this.width = 500;
    this.height = 33;
    this.rightMargin = 80; //30
    this.bottomMargin = 43;
    this.topMargin = 5;
    this.window = new BrowserWindow({
      name: this.name,
      width: this.width,
      height: this.height,
      x: this.display.workArea.x + this.display.workArea.width - this.width - this.rightMargin,
      y: this.display.workArea.y + this.topMargin,
      show: false,
      frame: false,
      movable: true,
      resizable: false,
      hasShadow: false,
      transparent: true,
      icon: this.icon,
      fullscreenable: false,
      toolbar: false,
      webPreferences: {
        zoomFactor: 1.0,
        toolbar: false,
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.window.setAlwaysOnTop(true, "screen-saver");

    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());

    this.showHideConsoleEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE,
      this,
      (event, arg) => this.onShowHideConsole(event, arg)
    );
    this.statusShowHideEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_STATUS_SHOW_HIDE,
      this,
      (event, arg) => this.onStatusShowHideCb(event, arg)
    ),

    this.isConsoleOpen = false;
    this.forceHide = false;
  }

  onShowCb() {
    log.info("[ActiveStatusWindow] opened window");
  }

  onClosedCb() {
    log.info("[ActiveStatusWindow] closed window");
    this.showHideConsoleEvent.remove();
    this.statusShowHideEvent.remove();
    WindowManagerHelper.closeActiveStatusWindow();
  }

  /**
   * Called with view requests the status window be shown or hidden
   * @param event
   * @param arg
   */
  onStatusShowHideCb(event, arg) {
    if (arg.show === 1) {
      this.forceHide = false;
    } else if (arg.show === 0) {
      this.forceHide = true;
    }
  }


  /**
   * When main console window is closed, we want to show the active status
   * @param event
   * @param arg
   */
  onShowHideConsole(event, arg) {
    if (AppFeatureToggle.isStatusBarEnabled()) {
      if (arg.showHideFlag === 0) {
        this.isConsoleOpen = true;
        this.window.hide();
      } else {
        this.isConsoleOpen = false;
        if (!this.forceHide) {
          this.window.show();
        }
      }
    } else {
      this.window.hide();
    }
  }

};
