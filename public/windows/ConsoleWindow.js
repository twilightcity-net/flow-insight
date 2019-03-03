const electron = require("electron"),
  { BrowserWindow } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  { EventManager } = require("../managers/EventManager");

/*
 * the main application window for UX. Suspose to slide in and out of
 * the top of the screen with a global hot key
 */
module.exports = class ConsoleWindow {
  constructor() {
    this.name = WindowManagerHelper.WindowNames.CONSOLE;
    this.view = ViewManagerHelper.ViewNames.CONSOLE;
    this.url = global.App.WindowManager.getWindowViewURL(this.view);
    this.display = electron.screen.getPrimaryDisplay();
    this.bounds = this.display.workAreaSize;

    log.info("width = " + this.bounds.width + ", " + this.bounds.height);
    this.icon = Util.getAppIcon("icon.ico");
    this.autoShow = false;
    this.window = new BrowserWindow({
      name: this.name,
      width: this.bounds.width,
      height: Math.floor(this.bounds.height / 2),
      x: 0,
      y: Math.floor(-this.bounds.height / 2),
      show: false,
      frame: false,
      movable: false,
      resizable: false,
      offscreen: true,
      transparent: true,
      icon: this.icon,
      fullscreenable: false,
      toolbar: false,
      webPreferences: { toolbar: false, webSecurity: false }
    });

    if (isDev) {
      this.window.webContents.openDevTools();

      // Install React Dev Tools
      // const {default: installExtension, REACT_DEVELOPER_TOOLS} = require('electron-devtools-installer');
      //
      // installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
      //   console.log(`Added Extension:  ${name}`);
      // })
      // .catch((err) => {
      //   console.log('An error occurred: ', err);
      // });
    }

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
      ),
      prepareForScreenShot: EventFactory.createEvent(
        EventFactory.Types.PREPARE_FOR_SCREENSHOT,
        this,
        (event, arg) => this.onPrepareForScreenshot(event, arg)
      ),
      readyForScreenShot: EventFactory.createEvent(
        EventFactory.Types.READY_FOR_SCREENSHOT,
        this
      ),
      screenShotComplete: EventFactory.createEvent(
        EventFactory.Types.SCREENSHOT_COMPLETE,
        this,
        (event, arg) => this.onScreenshotComplete(event, arg)
      ),
      screenShotReadyForDisplay: EventFactory.createEvent(
        EventFactory.Types.SCREENSHOT_READY_FOR_DISPLAY,
        this
      )
    };
    this.state = 0;
    this.states = {
      HIDDEN: 0,
      SHOWN: 1,
      SHOWING: 2,
      HIDING: 3,
      CANCEL: 4
    };
    this.consoleShortcut = {
      pressedState: 0,
      delay: 350
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
    if (isDev) return;
    this.hideConsole();
  }

  onPrepareForScreenshot(event, arg) {
    log.info("[ConsoleWindow] onPrepareForScreenshot");

    this.hideConsole();

    log.info("hidden!");

    let screenPath = Util.getLatestScreenshotPath();

    setTimeout(() => {
      this.events.readyForScreenShot.dispatch(screenPath, true);
    }, 1000);
  }

  onScreenshotComplete(event, arg) {
    log.info("[ConsoleWindow] onScreenshotComplete");

    this.showConsole();

    setTimeout(() => {
      this.events.screenShotReadyForDisplay.dispatch(arg, true);
    }, 100);
  }

  /*
   * event dispatched from global shortcut callback. in charge of showing or hiding
   * the console window.
   */
  onConsoleShowHideCb(event, arg) {
    if (
      this.state === this.states.SHOWING ||
      this.state === this.states.HIDING
    ) {
      this.state = this.states.CANCEL;
      return;
    }
    if (!this.window.isVisible()) {
      this.showConsole();
    } else {
      this.hideConsole();
    }
  }

  /*
   * shows the console window and returns the state of shown
   * @return {int} the current state of the window
   */
  showConsole() {
    log.info("[ConsoleWindow] show window -> " + this.name);
    this.state = this.states.SHOWING;
    // this.window.setPosition(0, Math.floor(-this.bounds.height / 2));
    this.window.setPosition(0, 0);
    this.window.show();
    this.window.focus();
    // this.animateShow(42, 14, this.window.getPosition()[1]);
    this.state = this.states.SHOWN;
  }

  /*
   * hides the console window and returns the state to hidden
   * @return {int} the current state of the window
   */
  hideConsole() {
    log.info("[ConsoleWindow] hide window -> " + this.name);
    this.state = this.states.HIDING;
    // this.animateHide(1, 14, this.window.getPosition()[1]);
    this.window.setPosition(0, 0);
    this.window.hide();
    this.state = this.states.HIDDEN;
  }
};
