const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  path = require("path"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  { EventManager, MainEvent } = require("../managers/EventManager");

/*
 * the main application window for UX. Suspose to slide in and out of 
 * the top of the screen with a global hot key
 */
module.exports = class ConsoleWindow {
  constructor() {
    this.name = WindowManagerHelper.WindowNames.CONSOLE;
    this.view = ViewManagerHelper.ViewNames.CONSOLE;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.icon = Util.getAppIcon("icon.ico");
    this.window = new BrowserWindow({
      name: this.name,
      width: 900,
      height: 680,
      show: false,
      backgroundColor: "#ffffff",
      icon: this.icon,
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });
    this.window.setMenu(null);
    this.autoShow = false;
    this.events = {
      ready: new ConsoleWindowEventReady(this)
    };
    this.window.on("ready-to-show", () => {
      EventManager.dispatch(EventManager.EventTypes.WINDOW_CONSOLE_READY);
    });
  }
};

class ConsoleWindowEventReady extends MainEvent {
  constructor(window) {
    super(EventManager.EventTypes.WINDOW_CONSOLE_READY, window);
    return this;
  }
}
