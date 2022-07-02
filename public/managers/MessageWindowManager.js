const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");
const {app} = require("electron");
const AppFeatureToggle = require("../app/AppFeatureToggle");

const is_mac = process.platform==='darwin';

/**
 * managing class for the sliding direct message windows
 */
module.exports = class MessageWindowManager {
  static windowNamePrefix = "tc-dm-";

  static WINDOW_LIMIT = 3;
  /**
   * builds the DMWindowManager for the global app scope
   */
  constructor() {
    this.name = "[DMWindowManager]";

    this.openDMWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_OPEN_DM,
      this,
      (event, arg) => this.onOpenDMCb(event, arg)
    );

    this.closeDMWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_DM,
      this,
      (event, arg) => this.onCloseDMCb(event, arg)
    );

    this.dmWindowsByName = new Map();
    this.orderedWindows = [];
  }


  openDMIfNotOpen(memberId) {
    let windowName = this.getWindowNameFromMemberId(memberId);

    const existingWindow = this.dmWindowsByName.get(windowName);

    if (!existingWindow) {
      this.closeOldestWindowIfOverLimit();

      console.log("creating window!");
      const arg = {
        memberId : memberId,
        dmIndex: this.dmWindowsByName.size,
        autoSlideOpen: false
      }

      let window = WindowManagerHelper.createDMWindow(
        windowName,
        arg
      );
      this.dmWindowsByName.set(windowName, window);
      this.orderedWindows.push(windowName);
    } else {
      //do nothing if window is already open
    }
  }

  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onOpenDMCb(event, arg) {
    let windowName = this.getWindowName(arg);

    const existingWindow = this.dmWindowsByName.get(windowName);

    if (!existingWindow) {

      this.closeOldestWindowIfOverLimit();

      console.log("creating window!");
      arg.dmIndex = this.dmWindowsByName.size;
      arg.autoSlideOpen = true;

      let window = WindowManagerHelper.createDMWindow(
        windowName,
        arg
      );

      this.dmWindowsByName.set(windowName, window);
      this.orderedWindows.push(windowName);
    } else {
      arg.dmIndex = this.dmWindowsByName.size;
      arg.autoSlideOpen = true;
      WindowManagerHelper.reloadDMWindow(existingWindow, arg);
    }

  }

  closeOldestWindowIfOverLimit() {
    if (this.dmWindowsByName.size === MessageWindowManager.WINDOW_LIMIT) {
      const firstWindowName = this.orderedWindows[0];

      this.closeAndCleanUpWindow(firstWindowName);
    }
  }




  /**
   * Unhide docked app if no windows are open, will be called in the onClose
   * handler of all the different DM message window types.  If the Moovie window
   * is still open, don't show the docked window yet, the moovie window will handle
   * putting the docked window back on close.
   */
  unhideDockIfNoMessageWindowsOpenIncludingMoovie() {
    if (AppFeatureToggle.consoleHasWindowInDock) {
      //unhide docked window when all DM windows are closed
      if(is_mac && this.dmWindowsByName.size === 0
        && !global.App.MoovieWindowManager.isMoovieWindowOpen()) {
        log.info("showing dock..");
        app.dock.show().then(() => {
          log.info("show returned!");
        });
      }
    }
  }

  /**
   * Unhide docked app if no windows are open, will be called in the onClose
   * handler of all the different DM message window types. This is called by
   * the Moovie window.  If there's dm message windows still open, they
   * will be responsible for bringing back the docked window.
   */
  unhideDockIfNoMessageWindowsOpen() {
    if (AppFeatureToggle.consoleHasWindowInDock) {
      //unhide docked window when all DM windows are closed
      if(is_mac && this.dmWindowsByName.size === 0) {
        log.info("showing dock..");
        app.dock.show().then(() => {
          log.info("show returned!");
        });
      }
    }
  }

  /**
   * Get the windows name using the memberId argument
   * @param arg
   * @returns {string}
   */
  getWindowName(arg) {
    let memberId = arg.memberId;
    let windowName = MessageWindowManager.windowNamePrefix;
    windowName += memberId;

    return windowName;
  }

  /**
   * Get the windows name using the memberId argument
   * @param memberId
   * @returns {string}
   */
  getWindowNameFromMemberId(memberId) {
    let windowName = MessageWindowManager.windowNamePrefix;
    windowName += memberId;

    return windowName;
  }

  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onCloseDMCb(event, arg) {
    let windowName = this.getWindowName(arg);

    this.closeAndCleanUpWindow(windowName);
  }

  closeAndCleanUpWindow(windowName) {
    let window = this.dmWindowsByName.get(windowName);
    if (window) {
      window.window.close();
      this.dmWindowsByName.delete(windowName);
      this.removeFromOrderedWindows(windowName);
      this.reassignWindowOrderPositions();
    }
  }

  reassignWindowOrderPositions() {
    for (let i = 0; i < this.orderedWindows.length; i++) {
      const windowName = this.orderedWindows[i];
      const window = this.dmWindowsByName.get(windowName);
      if (window) {
        window.resetDMIndex(i);
      }
    }
  }

  /**
   * Remove the window form the ordered window list since we're closing it
   * @param windowName
   */
  removeFromOrderedWindows(windowName) {
    for (let i = 0; i < this.orderedWindows.length; i++) {
      if (this.orderedWindows[i] === windowName) {
        this.orderedWindows.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Called when a close event is triggered on the window.
   * The original arguments are passed to determine which window to close
   * @param arg
   */
  closeDMWindow(arg) {
    let windowName = this.getWindowName(arg);

    WindowManagerHelper.closeWindow(windowName);

    this.removeFromOrderedWindows(windowName);
    this.dmWindowsByName.delete(windowName);
  }

  /**
   * Close all the open dm windows
   */
  closeAllDMWindows() {
    for (let windowName of this.dmWindowsByName.keys()) {
      global.App.WindowManager.closeWindowByName(
        windowName
      );
    }
    this.orderedWindows = [];
    this.dmWindowsByName.clear();
  }
};
