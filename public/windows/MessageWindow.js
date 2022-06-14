const { app, BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory");

const is_mac = process.platform==='darwin';

/**
 * Launch a separate direct messaging window that appears as a tabbed
 * slide-outable window for talking with a specific person
 */
module.exports = class MessageWindow {
  constructor(windowName, arg) {
    this.arg = arg;
    this.name = windowName;
    this.dmIndex = this.arg.dmIndex;
    this.memberId = this.arg.memberId;
    console.log("Window: "+this.dmIndex + ":" + this.memberId);
    this.view = ViewManagerHelper.ViewNames.MESSAGE;
    this.url = global.App.WindowManager.getWindowViewURL(this.view, arg);
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.collapsedWindowWidth = 50;
    this.collapsedWindowHeight = 60;
    this.slideOutWindowWidth = 400;
    this.tabAdjustment = 65;
    this.autoShow = true;
    this.isClosed = false;

    this.topMargin = Math.round(this.display.workAreaSize.height * 0.16);
    this.bottomMargin = Math.round(this.display.workAreaSize.height * 0.11);
    this.baseHeight = this.display.workAreaSize.height - this.topMargin - this.bottomMargin;

    this.window = new BrowserWindow({
      name: this.name,
      width: this.collapsedWindowWidth,
      height: this.collapsedWindowHeight,
      x: this.display.workArea.x + this.display.workAreaSize.width - this.collapsedWindowWidth,
      y: this.getCollapsedYPosition(),
      show: false,
      frame: false,
      movable: false,
      resizable: false,
      hasShadow: false,
      offscreen: true,
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
    this.window.setVisibleOnAllWorkspaces(true);

    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.window.on('blur', () => this.onBlurCb());


    if(is_mac && app.dock.isVisible()) {
      app.dock.hide();
    }

    this.events = {
      consoleShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHAT_CONSOLE_SHOW_HIDE,
        this,
        (event, arg) => this.onChatConsoleShowHideCb(event, arg)
      ),
      consoleShown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHAT_CONSOLE_SHOWN,
        this
      ),
      consoleHidden: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHAT_CONSOLE_HIDDEN,
        this
      ),
      consoleBlur: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHAT_CONSOLE_BLUR,
        this
      ),
    };

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

  getCollapsedYPosition() {
    return (this.display.workArea.y + this.topMargin + this.baseHeight
      - this.collapsedWindowHeight - ((this.dmIndex+1)*this.tabAdjustment));
  }

  getYPosition() {
    return (this.display.workArea.y + this.topMargin - this.tabAdjustment)
  }

  getHeight() {
    return (this.display.workAreaSize.height - this.topMargin - this.bottomMargin - (this.dmIndex*this.tabAdjustment))
  }

  /**
   * Updates the dm tab index position, and refresh the window in it's new location
   * If a tab is closed, the other windows are adjusted to fill in the gap.
   * @param newIndex
   */
  resetDMIndex(newIndex) {
    this.dmIndex = newIndex;
    if (this.state === this.states.SHOWN) {
      this.updateToExpandedConsole();
    } else {
      this.updateToCollapsedConsole();
    }
  }

  onShowCb() {
    log.info("[DMWindow] opened window");
  }

  onClosedCb() {
    log.info("[DMWindow] closed window");
    this.isClosed = true;
    global.App.DMWindowManager.closeDMWindow(this.arg);

    this.events.consoleShowHide.remove();
    this.events.consoleShown.remove();
    this.events.consoleHidden.remove();
    this.events.consoleBlur.remove();
  }

  onBlurCb() {
    log.info("[DMWindow] blur window");

    if (this.state !== this.states.HIDING) {
      this.events.consoleBlur.dispatch({memberId: this.memberId});
      this.hideConsole();
    }
  }

  /**
   * event dispatched from global shortcut callback. in charge of showing or hiding the console window.
   */
  onChatConsoleShowHideCb(event, arg) {
    if (arg.memberId !== this.memberId) {
      return;
    }

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
    console.log("show console!");
    this.state = this.states.SHOWING;

    if (!this.isClosed) {
      this.updateToExpandedConsole();
      this.window.show();
      this.window.focus();
    }

    setTimeout(() => {
      if (!this.isClosed) {
        this.state = this.states.SHOWN;
        this.events.consoleShown.dispatch({memberId: this.memberId});
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
        this.updateToCollapsedConsole();
        this.events.consoleHidden.dispatch({memberId: this.memberId});
      }
    }, this.animateTimeMs);
  }


  /**
   * Update the coordinates of the window to be displayed fully on the screen
   * The work area display coordinates can be shifted if there are multiple displays sharing the same coordinate
   * system, so 0,0 relative to a work area, we should use the x, y of the work area.
   */
  updateToExpandedConsole() {
    this.display = global.App.WindowManager.getDisplay();

    this.window.setPosition(
      this.display.workArea.x + this.display.workAreaSize.width - this.slideOutWindowWidth,
      this.getYPosition()
    );
    this.window.setSize(this.slideOutWindowWidth,
      this.getHeight(),
    );
  }

  /**
   * Collapse the chat console to only show the little Profile, and the rest being hidden off the screen
   */
  updateToCollapsedConsole() {
    this.display = global.App.WindowManager.getDisplay();

    this.window.setPosition(
      this.display.workArea.x + this.display.workAreaSize.width - this.collapsedWindowWidth,
      this.getCollapsedYPosition()
    );
    this.window.setSize(this.collapsedWindowWidth,
      this.collapsedWindowHeight,
    );
  }
};
