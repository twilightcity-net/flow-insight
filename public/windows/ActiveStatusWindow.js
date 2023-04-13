const { BrowserWindow, app} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory");

/**
 * A floating active status window. Draggable around the screen, and detached from the console.
 * Appears when the console is closed to show the active status.
 */
module.exports = class ActiveStatusWindow {
  constructor(windowName, arg) {
    this.arg = arg;
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.STATUS;
    this.url = global.App.WindowManager.getWindowViewURL(this.view, arg);
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = true;
    this.isClosed = false;
    this.width = 500;
    this.height = 33;
    this.window = new BrowserWindow({
      name: this.name,
      width: this.width,
      height: this.height,
      x: this.display.workArea.x + this.display.workArea.width - this.width,
      y: this.display.workArea.y + this.display.workArea.height - this.height,
      show: false,
      frame: false,
      movable: true,
      resizable: false,
      hasShadow: false,
      transparent: true,
      icon: this.icon,
      fullscreenable: false,
      toolbar: false,
      webPreferences: {
        zoomFactor: 1.0,
        toolbar: false,
        webSecurity: true,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.window.setAlwaysOnTop(true, "screen-saver");

    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.window.on('blur', () => this.onBlurCb());

    this.events = {
      consoleShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_ACTIVE_STATUS_SHOW_HIDE,
        this,
        (event, arg) => this.onChatConsoleShowHideCb(event, arg)
      ),
      consoleShown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_ACTIVE_STATUS_SHOWN,
        this
      ),
      consoleHidden: EventFactory.createEvent(
        EventFactory.Types.WINDOW_ACTIVE_STATUS_HIDDEN,
        this
      ),
    };

    console.log("INIT STATUS WINDOW!!")

    this.state = 0;
    this.states = {
      HIDDEN: 0,
      SHOWN: 1,
      SHOWING: 2,
      HIDING: 3,
      CANCEL: 4,
    };

    this.animateTimeMs = 400;
  }

  onShowCb() {
    log.info("[ActiveStatusWindow] opened window");
  }

  onClosedCb() {
    log.info("[ActiveStatusWindow] closed window");
    this.isClosed = true;
    WindowManagerHelper.closeActiveStatusWindow();

    this.events.consoleShowHide.remove();
    this.events.consoleShown.remove();
    this.events.consoleHidden.remove();
  }

  onBlurCb() {
    log.info("[ActiveStatusWindow] blur window");

    if (this.state !== this.states.HIDING) {
      this.hideConsole();
    }
  }

  /**
   * event dispatched from global shortcut callback. in charge of showing or hiding the console window.
   */
  onChatConsoleShowHideCb(event, arg) {
    console.log("called onChatConsoleShowHideCb");
    console.log("arg = "+arg.show);

    //ignore requests when there is already an animation going on
    if (this.state === this.states.SHOWING ||
      this.state === this.states.HIDING) {
      return;
    }

    if (arg.show === 1) {
      this.showConsole();
    } else if (arg.show === 0) {
      this.hideConsole();
    }
  }

  /**
   * After the showing of the console, updates the state to shown and dispatches event
   */
  showConsole() {
    this.state = this.states.SHOWING;

    if (!this.isClosed) {
      this.window.show();
      this.window.focus();
    }

    setTimeout(() => {
      if (!this.isClosed) {
        this.state = this.states.SHOWN;
        this.events.consoleShown.dispatch({});
      }
    }, this.animateTimeMs);
  }

  /**
   * After the collapse of the console updates the state to hidden and dispatches event
   */
  hideConsole() {
    this.state = this.states.HIDING;
    setTimeout(() => {
      if (!this.isClosed) {
        this.state = this.states.HIDDEN;
        this.events.consoleHidden.dispatch({});
      }
    }, this.animateTimeMs);
  }


};
