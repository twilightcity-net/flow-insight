const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../ViewManagerHelper"),
  WindowManagerHelper = require("../WindowManagerHelper"),
  { EventManager, MainEvent } = require("../EventManager");

/*
 * The Application loading window. Loads LoadingView class. This window
 * is always show when the application first loads
 */
module.exports = class LoadingWindow {
  constructor() {
    this.name = WindowManagerHelper.WindowNames.LOADING;
    this.view = ViewManagerHelper.ViewNames.LOADING;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.icon = Util.getAppIcon("icon.ico");
    this.window = new BrowserWindow({
      name: this.name,
      width: 360,
      height: 160,
      minWidth: 360,
      minHeight: 160,
      resizable: false,
      show: false,
      icon: this.icon,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });
    this.window.setMenu(null);
    this.autoShow = true;
    this.events = {
      shown: new LoadingWindowEventShown(this)
    };
    this.window.on("show", () => {
      EventManager.dispatch(EventManager.EventTypes.WINDOW_LOADING_SHOWN);
    });
  }
};

class LoadingWindowEventShown extends MainEvent {
  constructor(window) {
    super(EventManager.EventTypes.WINDOW_LOADING_SHOWN, window);
    return this;
  }
}
