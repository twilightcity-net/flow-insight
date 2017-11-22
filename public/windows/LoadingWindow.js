const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  { ShortcutManager, Shortcut } = require("../managers/ShortcutManager");

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
    this.autoShow = true;
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
    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShow());
    this.events = {
      shown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_SHOWN,
        this
      )
    };
    this.shortcuts = {
      windowTest: new Shortcut(
        ShortcutManager.Names.TEST_WINDOW,
        "CommandOrControl+`",
        this,
        () => {
          log.info(
            "[ShortcutManager] recieved shortcut keypress -> windowTest"
          );
        }
      )
    };
  }

  onShow() {
    this.events.shown.dispatch();
  }
};
