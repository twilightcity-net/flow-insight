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
      (event, arg) => this.onOpenChartCb(event, arg)
    );

    this.closeChartWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_CHART,
      this,
      (event, arg) => this.onCloseChartCb(event, arg)
    );

    this.hideConsoleEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE,
      this,
      (event, arg) => this.onHideConsole(event, arg)
    );

    this.chartWindowsByName = new Map();
  }

  static get ChartType() {
    return {
      TASK_FOR_WTF: "task-for-wtf",
      TASK_BY_NAME: "task-by-name",
    };
  }

  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onOpenChartCb(event, arg) {
    let windowName = this.getWindowName(arg);

    arg.chartIndex = this.chartWindowsByName.size;

    let window = WindowManagerHelper.createChartWindow(
      windowName,
      arg
    );
    this.chartWindowsByName.set(windowName, window);
  }

  getWindowName(arg) {
    let chartType = arg.chartType,
      circuitName = arg.circuitName,
      projectName = arg.projectName,
      username = arg.username,
      taskName = arg.taskName;

    let windowName = ChartWindowManager.windowNamePrefix;

    if (
      chartType ===
      ChartWindowManager.ChartType.TASK_FOR_WTF
    ) {
      windowName += circuitName;
    } else if (
      chartType ===
      ChartWindowManager.ChartType.TASK_BY_NAME
    ) {
      windowName +=
        username + "." + projectName + "." + taskName;
    } else {
      throw new Error(
        "Unable to open unknown chart type: " + chartType
      );
    }

    return windowName;
  }

  /**
   * When an open chart window is triggered, opens and creates the window
   * and passes in the properties.
   * @param event
   * @param arg
   */
  onCloseChartCb(event, arg) {
    let windowName = this.getWindowName(arg);

    let window = this.chartWindowsByName.get(windowName);
    if (window) {
      window.window.close();
    }
  }

  /**
   * When the console hides, close all the chart popups
   * @param arg
   */
  onHideConsole(event, arg) {
    if (arg.showHideFlag === 1) {
      //closing
      this.closeAllChartWindows();
    }
  }

  /**
   * Called when a close event is triggered on the window.
   * The original arguments are passed to determine which window to close
   * @param arg
   */
  closeChartWindow(arg) {
    let windowName = this.getWindowName(arg);

    WindowManagerHelper.closeWindow(windowName);

    this.chartWindowsByName.delete(windowName);
  }

  /**
   * Close all the open chart windows
   */
  closeAllChartWindows() {
    for (let windowName of this.chartWindowsByName.keys()) {
      global.App.WindowManager.closeWindowByName(
        windowName
      );
    }
    this.chartWindowsByName.clear();
  }
};
