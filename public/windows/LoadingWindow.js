const { BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  isDev = require("electron-is-dev"),
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
      width: 600,
      height: 340,
      minWidth: 600,
      minHeight: 340,
      resizable: false,
      movable: false,
      center: true,
      frame: false,
      show: false,
      icon: this.icon,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: { toolbar: false }
    });

    /// if dev mode then show debug tools. Install react tools
    // if (isDev) {
    //   this.window.webContents.openDevTools({mode: "undocked"});
    // }

    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.events = {
      shown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_LOADING_SHOWN,
        this
      )
    };
    this.shortcuts = {
      windowTest: new Shortcut(
        ShortcutManager.Names.TEST_WINDOW,
        "CommandOrControl+Shift+`",
        this,
        () => {
          log.info(
            "[ShortcutManager] recieved shortcut keypress -> windowTest"
          );
        }
      )
    };
  }

  onShowCb() {
    this.events.shown.dispatch();
  }

  onClosedCb() {
    log.info("[LoadingWindow] closed window -> enable global shortcuts");
    global.App.ShortcutManager.enabled = true;
  }
};
