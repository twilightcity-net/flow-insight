const { BrowserWindow, app} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  isDev = require("electron-is-dev"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory"),
  {
    ShortcutManager,
    Shortcut,
  } = require("../managers/ShortcutManager");

/*
 * The fervie window contains an animated fun button that starts a pair request
 */
module.exports = class FervieWindow {
  constructor(windowName, arg) {
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.FERVIE;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view,
      arg
    );

    this.extraBubbleHeight = 300;
    this.extraBubbleWidth = 150;
    this.fervieHeight = 58;
    this.fervieWidth = 136;
    this.rightMargin = 40;
    this.bottomMargin = 10;

    this.animateTimeMs = 1000;

    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.window = new BrowserWindow({
      name: this.name,
      width: this.fervieWidth + this.extraBubbleWidth,
      height:  this.fervieHeight + this.extraBubbleHeight,
      minWidth: this.fervieWidth + this.extraBubbleWidth,
      minHeight:  this.fervieHeight + this.extraBubbleHeight,
      x: Math.floor(this.display.workArea.x + this.display.workAreaSize.width
        - this.fervieWidth - this.extraBubbleWidth - this.rightMargin),
      y: Math.floor(this.display.workArea.y + this.display.workAreaSize.height
        - this.fervieHeight - this.extraBubbleHeight - this.bottomMargin),
      resizable: false,
      hasShadow: false,
      transparent: true,
      movable: false,
      center: true,
      frame: false,
      show: false,
      icon: this.icon,
      fullscreenable: false,
      webPreferences: {
        toolbar: false,
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.setAlwaysOnTop(true, "screen-saver");
    this.window.setVisibleOnAllWorkspaces(true);

    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.events = {
      fervieShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_FERVIE_SHOW_HIDE,
        this,
        (event, arg) => this.onFervieShowHideCb(event, arg)
      ),
      fervieShowing: EventFactory.createEvent(
        EventFactory.Types.WINDOW_FERVIE_SHOWING,
        this
      ),
      fervieHiding: EventFactory.createEvent(
        EventFactory.Types.WINDOW_FERVIE_HIDING,
        this
      ),
    };

    this.isOpen = true;

    this.state = 0;
    this.states = {
      HIDDEN: 0,
      SHOWN: 1,
      SHOWING: 2,
      HIDING: 3,
      CANCEL: 4,
    };

    WindowManagerHelper.hideDockWhileConsoleStaysOnTop();
    setTimeout(() => {
      WindowManagerHelper.unhideDock();
    }, 1000);

  }

  onFervieShowHideCb() {
    //ignore requests when there is already an animation going on
    if (this.state === this.states.SHOWING ||
      this.state === this.states.HIDING) {
      return;
    }

    if (this.state === this.states.HIDDEN) {
      this.showFervie();
    } else if (this.state === this.states.SHOWN) {
      this.hideFervie();
    }
  }


  /**
   * After the showing of the fervie, updates the state to shown and dispatches event
   */
  showFervie() {
    console.log("show fervie!");
    this.state = this.states.SHOWING;

    if (!this.isClosed) {
      this.window.show();
      this.window.focus();
      this.events.fervieShowing.dispatch({});
    }

    setTimeout(() => {
      this.state = this.states.SHOWN;
    }, this.animateTimeMs);
  }

  /**
   * After the hiding of the fervie updates the state to hidden and dispatches event
   */
  hideFervie() {
    console.log("hide fervie!");
    this.state = this.states.HIDING;

    if (!this.isClosed) {
      this.events.fervieHiding.dispatch({});
    }

    setTimeout(() => {
      this.state = this.states.HIDDEN;
      if (!this.isClosed) {
        this.window.hide();
        this.restorePreviousWindowFocus();
      }
    }, this.animateTimeMs);
  }

  restorePreviousWindowFocus() {
    WindowManagerHelper.forceConsoleWindowOnTop();
    global.App.hide();
    global.App.show();
    setTimeout(() => {
      WindowManagerHelper.relieveConsoleFromAlwaysOnTop();
    }, 333);
  }

  onShowCb() {
    log.info("[FervieWindow] show window");
  }

  onClosedCb() {
    log.info("[FervieWindow] closed window -> enable global shortcuts");
    this.isClosed = true;
  }


};
