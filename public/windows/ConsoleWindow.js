const { BrowserWindow } = require("electron"),
  path = require("path"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory");

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
    this.autoShow = false;
    this.window = new BrowserWindow({
      name: this.name,
      width: 900,
      height: 680,
      show: false,
      frame: false,
      // transparent: true,
      // opacity: 0.7,
      backgroundColor: "#ffffff",
      icon: this.icon,
      fullscreenable: false,
      webPreferences: { toolbar: false }
    });
    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("ready-to-show", () => this.onReadyToShowCb());
    this.events = {
      ready: this.onReadyCb(),
      consoleShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        (event, arg) => this.onConsoleShowHideCb(event, arg)
      )
    };
    this.states = {};
    // this.window.on("blur", event => {
    //   log.info("[ConsoleWindow] blur window -> " + event);
    //   this.window.hide();
    // });
  }

  onReadyToShowCb() {
    this.events.ready.dispatch();
  }

  onReadyCb() {
    return EventFactory.createEvent(
      EventFactory.Types.WINDOW_CONSOLE_READY,
      this
    );
  }

  onConsoleShowHideCb(event, arg) {
    console.log("<<<<<<<<<<");
    global.App.WindowManager.toggleWindow(this);
  }
};
