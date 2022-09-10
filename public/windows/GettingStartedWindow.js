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
 * The getting started splash screen that instructs the user how to open the app
 */
module.exports = class GettingStartedWindow {
  constructor(windowName, arg) {
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.GETSTARTED;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view,
      arg
    );
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = true;
    this.window = new BrowserWindow({
      name: this.name,
      width: 600,
      height: 120,
      minWidth: 600,
      minHeight: 120,
      x: Math.floor(this.display.workArea.x + this.display.workAreaSize.width/2 - 300),
      y: Math.floor(this.display.workArea.y + 50),
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

    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.events = {
    };

    this.hideConsoleEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE,
      this,
      (event, arg) => this.onHideConsole(event, arg)
    );

    this.isOpen = true;
  }

  onShowCb() {
    log.info("[GettingStartedWindow] show window");
    let consoleWindow = global.App.WindowManager.getWindow(WindowManagerHelper.WindowNames.CONSOLE);
    if (consoleWindow) {
      if (consoleWindow.hasOpened()) {
        this.onHideConsole();
      }
    }
  }

  onClosedCb() {
    log.info("[GettingStartedWindow] closed window -> enable global shortcuts");
    this.hideConsoleEvent.remove();
  }

  onHideConsole(event, arg) {
    if (this.isOpen) {
      this.isOpen = false;
      WindowManagerHelper.closeGettingStartedWindow();
    }
  }
};
