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

    this.chartWindowNames = new Set();

  }



  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onOpenChartCb(event, arg) {
    let windowName = ChartWindowManager.windowNamePrefix + arg.circuitName;

    arg.chartIndex = this.chartWindowNames.size;

    WindowManagerHelper.createChartWindow(windowName, arg);
    this.chartWindowNames.add(windowName);
  }

  /**
   * Called when a close event is triggered on the window.
   * The original arguments are passed to determine which window to close
   * @param arg
   */
  closeChartWindow(arg) {
    let windowName = ChartWindowManager.windowNamePrefix + arg.circuitName;

    WindowManagerHelper.closeChartWindow(windowName);

    this.chartWindowNames.delete(windowName);
  }

  /**
   * Close all the open chart windows
   */
  closeAllChartWindows() {
    for (let windowName of this.chartWindowNames) {
      global.App.WindowManager.closeWindowByName(windowName);
    }
    this.chartWindowNames.clear();
  }

};
