const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  { EventManager, MainEvent } = require("./EventManager"),
  log = require("electron-log");

/*
 * The Application loading window. Loads LoadingView class. This window
 * is always show when the application first loads
 */
module.exports = class LoadingWindow {
  constructor() {
    this.name = WindowManager.WindowNames.LOADING;
    this.view = ViewManagerHelper.ViewNames.LOADING;
    this.url = WindowManager.getWindowViewURL(this.view);
    this.window = new BrowserWindow({
      name: this.name,
      width: 360,
      height: 160,
      minWidth: 360,
      minHeight: 160,
      resizable: false,
      show: false,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });
    this.window.setMenu(null);
    this.events = {
      shown: new LoadingWindowEventShown(this)
    };
    this.window.on("show", () => {
      EventManager.dispatch(EventManager.EventTypes.WINDOW_LOADING_SHOWN, 0);
    });
  }
};

class LoadingWindowEventShown extends MainEvent {
  constructor(window) {
    super(EventManager.EventTypes.WINDOW_LOADING_SHOWN, window);
    return this;
  }
}
