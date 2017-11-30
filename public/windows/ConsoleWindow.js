const { BrowserWindow } = require("electron"),
  path = require("path"),
  log = require("electron-log"),
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
      ready: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_READY,
        this
      ),
      consoleShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        (event, arg) => this.onConsoleShowHideCb(event, arg)
      ),
      blurWindow: EventFactory.createEvent(
        EventFactory.Types.WINDOW_BLUR,
        this,
        (event, arg) => this.onBlurWindowCb(event, arg)
      )
    };
    this.state = 0;
    this.states = {
      HIDDEN: 0,
      SHOWN: 1,
      SHOWING: 2,
      HIDING: 3
    };
  }

  /*
   * electron window event emitted when the window is ready to be show.. during
   * app loading
   */
  onReadyToShowCb() {
    this.events.ready.dispatch();
  }

  /*
   * event callback dispatched when the console window looses focus.. hide it
   */
  onBlurWindowCb(event, arg) {
    log.info("[ConsoleWindow] blur window -> " + arg.sender.name);
    this.hideConsole();
  }

  /*
   * event dispatched from global shortcut callback. in charge of showing or hiding
   * the console window.
   */
  onConsoleShowHideCb(event, arg) {
    if (!this.window.isVisible()) {
      this.state = this.showConsole();
    } else {
      this.state = this.hideConsole();
    }
  }

  /*
   * hides the console window and returns the state to hidden
   * @return {int} the current state of the window
   */
  hideConsole() {
    log.info("[ConsoleWindow] hide window -> " + this.name);
    this.window.hide();
    return this.states.HIDDEN;
  }

  /*
   * shows the console window and returns the state of shown
   * @return {int} the current state of the window
   */
  showConsole() {
    log.info("[ConsoleWindow] show window -> " + this.name);
    this.window.show();
    this.window.focus();
    return this.states.SHOWN;
  }
};
