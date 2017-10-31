const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  path = require("path"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  { EventManager, MainEvent } = require("./EventManager"),
  assetsDirectory = path.join(__dirname, "assets"),
  applicationIcon = assetsDirectory + "/icons/icon.ico";

/*
 * the main application window for UX. Suspose to slide in and out of 
 * the top of the screen with a global hot key
 */
module.exports = class ConsoleWindow {
  constructor() {
    this.name = global.App.WindowManager.types.CONSOLE;
    this.view = ViewManagerHelper.ViewNames.CONSOLE;
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
