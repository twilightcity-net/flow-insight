const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");

/**
 * managing class for the sliding direct message windows
 */
module.exports = class DMWindowManager {
  static windowNamePrefix = "tc-dm-";

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
  }


  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onOpenDMCb(event, arg) {
    console.log("open DM!");
    console.log(arg);
    let windowName = this.getWindowName(arg);

    arg.chartIndex = this.dmWindowsByName.size;

    let window = WindowManagerHelper.createDMWindow(
      windowName,
      arg
    );
    this.dmWindowsByName.set(windowName, window);
  }

  /**
   * Get the windows name using the memberId argument
   * @param arg
   * @returns {string}
   */
  getWindowName(arg) {
    let memberId = arg.memberId;

    let windowName = DMWindowManager.windowNamePrefix;

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

    let window = this.dmWindowsByName.get(windowName);
    if (window) {
      window.window.close();
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
    this.dmWindowsByName.clear();
  }
};
