const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");

/**
 * managing class for the popup chart windows
 */
module.exports = class ChartWindowManager {

  static windowNamePrefix = "tc-chart-";

  /**
   * builds the ChartWindowManager for the global app scope
   */
  constructor() {
    this.name = "[ChartWindowManager]";

    this.openChartWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_OPEN_CHART,
      this,
      (event, arg) =>
        this.onOpenChartCb(event, arg)
    );

    this.closeChartWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_CHART,
      this,
      (event, arg) =>
        this.onCloseChartCb(event, arg)
    );

    this.chartWindowsByName = new Map();

  }



  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onOpenChartCb(event, arg) {
    let windowName = ChartWindowManager.windowNamePrefix + arg.circuitName;

    arg.chartIndex = this.chartWindowsByName.size;

    let window = WindowManagerHelper.createChartWindow(windowName, arg);
    this.chartWindowsByName.set(windowName, window);
  }

  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onCloseChartCb(event, arg) {
    let windowName = ChartWindowManager.windowNamePrefix + arg.circuitName;

    let window = this.chartWindowsByName.get(windowName);
    if (window) {
      window.window.close();
    }
  }


  /**
   * Called when a close event is triggered on the window.
   * The original arguments are passed to determine which window to close
   * @param arg
   */
  closeChartWindow(arg) {
    let windowName = ChartWindowManager.windowNamePrefix + arg.circuitName;

    WindowManagerHelper.closeChartWindow(windowName);

    this.chartWindowsByName.delete(windowName);
  }

  /**
   * Close all the open chart windows
   */
  closeAllChartWindows() {
    for (let windowName of this.chartWindowsByName.keys()) {
      global.App.WindowManager.closeWindowByName(windowName);
    }
    this.chartWindowsByName.clear();
  }

};
