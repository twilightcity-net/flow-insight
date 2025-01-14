const { app, BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory"),
  {
    Shortcut,
    ShortcutManager,
  } = require("../managers/ShortcutManager");
const AppConfig = require("../app/AppConfig");

const is_mac = process.platform === "darwin";

/**
 * the main application window for UX. Suspose to slide in and out of
 * the top of the screen with a global hot key
 * @type {ConsoleWindow}
 */
module.exports = class ConsoleWindow {
  /**
   * create a new console window
   */
  constructor(windowName, arg) {
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.CONSOLE;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view,
      arg
    );
    this.display = global.App.WindowManager.getDisplay();
    this.icon = Util.getAppIcon("icon.ico");
    this.window = new BrowserWindow({
      name: this.name,
      width: this.display.workAreaSize.width,
      height: Math.floor(
        this.display.workAreaSize.height / 2
      ),
      x: 0,
      y: Math.floor(-this.display.workAreaSize.height / 2),
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
    this.window.name = this.name;
    this.window.setMenu(null);

    if (!AppConfig.isConsoleWindowedInDockMode()) {
      if (is_mac) {
        app.dock.hide();
      }
    }

    if (AppConfig.isMoovieApp()) {
      this.window.setAlwaysOnTop(true, "screen-saver");
      this.window.setVisibleOnAllWorkspaces(true);
    }

    //this.window.setAlwaysOnTop(true, "screen-saver");
    // this.window.setAlwaysOnTop(true, "torn-off-menu");

    this.window.on("ready-to-show", () =>
      this.onReadyToShowCb()
    );
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
      consoleShown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_SHOWN,
        this
      ),
      consoleHidden: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_HIDDEN,
        this
      ),
      prepareForScreenShot: EventFactory.createEvent(
        EventFactory.Types.PREPARE_FOR_SCREENSHOT,
        this,
        (event, arg) =>
          this.onPrepareForScreenshot(event, arg)
      ),
      readyForScreenShot: EventFactory.createEvent(
        EventFactory.Types.READY_FOR_SCREENSHOT,
        this
      ),
      screenShotComplete: EventFactory.createEvent(
        EventFactory.Types.SCREENSHOT_COMPLETE,
        this,
        (event, arg) =>
          this.onScreenshotComplete(event, arg)
      ),
      screenShotReadyForDisplay: EventFactory.createEvent(
        EventFactory.Types.SCREENSHOT_READY_FOR_DISPLAY,
        this
      ),
      sidebarShowNotifier: EventFactory.createEvent(
        EventFactory.Types
          .SHORTCUTS_WINDOW_CONSOLE_SIDEBAR_SHOW,
        this
      ),
    };
    this.shortcuts = {
      sidebarFirstItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_FIRST_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_FIRST_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_FIRST_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(1);
        },
        this
      ),
      sidebarSecondItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_SECOND_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_SECOND_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_SECOND_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(2);
        },
        this
      ),
      sidebarThirdItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_THIRD_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_THIRD_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_THIRD_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(3);
        },
        this
      ),
      sidebarFourthItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_FOURTH_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_FOURTH_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_FOURTH_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(4);
        },
        this
      ),
      sidebarFifthItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_FIFTH_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_FIFTH_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_FIFTH_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(5);
        },
        this
      ),
      sidebarWTFItem: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_WTF_ITEM,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_WTF_ITEM,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_WTF_ITEM"
          );
          this.events.sidebarShowNotifier.dispatch(0);
        },
        this
      ),
      sidebarWTFItemAlt: new Shortcut(
        ShortcutManager.Names.WINDOW_SIDEBAR_WTF_ITEM_ALT,
        ShortcutManager.Accelerators.WINDOW_SIDEBAR_WTF_ITEM_ALT,
        this,
        () => {
          log.info(
            "[ConsoleWindow] received shortcut keypress -> WINDOW_SIDEBAR_WTF_ITEM_ALT"
          );
          this.events.sidebarShowNotifier.dispatch(0);
        },
        this
      ),
    };
    this.state = 0;
    this.hasOpenedOnce = false;
    this.states = {
      HIDDEN: 0,
      SHOWN: 1,
      SHOWING: 2,
      HIDING: 3,
      CANCEL: 4,
    };
    this.consoleShortcut = {
      pressedState: 0,
      delay: 420,
    };
    this.animateTimeMs = 400;
  }

  /**
   * electron window event emitted when the window is ready to be show.. during
   * app loading - CALLBACK
   */
  onReadyToShowCb() {
    this.events.ready.dispatch({});
  }

  /**
   * pre-screenshot handler
   */
  onPrepareForScreenshot() {
    this.hideConsole();
    let screenPath = Util.getLatestScreenshotPath();
    setTimeout(() => {
      this.events.readyForScreenShot.dispatch(
        screenPath,
        true
      );
    }, 1000);
  }

  /**
   * notified when the screenshow is complete, then dispatches an event to display ss and console
   * @param event
   * @param arg
   */
  onScreenshotComplete(event, arg) {
    this.showConsole();

    setTimeout(() => {
      this.events.screenShotReadyForDisplay.dispatch(
        arg,
        true
      );
    }, 100);
  }

  /**
   * event dispatched from global shortcut callback. in charge of showing or hiding the console window.
   */
  onConsoleShowHideCb(event, arg) {
    if (
      this.state === this.states.SHOWING ||
      this.state === this.states.HIDING
    ) {
      return;
    }
    if (this.state === this.states.HIDDEN) {
      this.hasOpenedOnce = true;
      this.updateConsoleToOpenPosition();
      this.showConsole();
    } else if (this.state === this.states.SHOWN) {
      this.hideConsole();
    }
  }

  forceOnTop() {
    this.window.setAlwaysOnTop(true, "screen-saver");
  }

  relieveOnTop() {
    this.window.setAlwaysOnTop(false, "screen-saver");
  }

  isShown() {
    return this.state === this.states.SHOWN;
  }

  hasOpened() {
    return this.hasOpenedOnce;
  }

  /**
   * updates the console's size and position from the currently stored display
   */
  updateConsoleToOpenPosition() {
    this.display = global.App.WindowManager.getDisplay();
    this.window.setPosition(
      this.display.workArea.x,
      this.display.workArea.y
    );
    this.window.setSize(
      this.display.workAreaSize.width,
      Math.floor(this.display.workAreaSize.height / 2)
    );
  }

  /**
   * shows the console window and returns the state of shown
   */
  showConsole() {
    this.state = this.states.SHOWING;
    this.window.show();
    this.window.focus();
    setTimeout(() => {
      this.state = this.states.SHOWN;
      this.events.consoleShown.dispatch({});
    }, this.animateTimeMs);
  }

  /**
   * hides the console window and returns the state to hidden
   */
  hideConsole() {
    this.state = this.states.HIDING;
    setTimeout(() => {
      this.window.hide();

      //this is only necessary if we have the app in dock
      this.restorePreviousWindowFocus();
      this.state = this.states.HIDDEN;
      this.events.consoleHidden.dispatch({});
    }, this.animateTimeMs);
  }

  restorePreviousWindowFocus() {
    global.App.hide();
    global.App.show();
  }
};
