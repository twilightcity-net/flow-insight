const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");

/**
 * managing class for the popup chart windows
 */
module.exports = class ChartWindowManager {
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
      EventFactory.Types.WINDOW_CHART_CLOSED,
      this,
      (event, arg) =>
        this.onCloseChartCb(event, arg)
    );

  }

  closeChartWindow(chartName) {
    log.info("XXX closeChartWindow");
    WindowManagerHelper.closeChartWindow(chartName);
  }

  onOpenChartCb(event, arg) {
    log.info("XXX onOpenChartCb");
    this.chartWindow = WindowManagerHelper.createWindowChartPopout();
  }

  onCloseChartCb(event, arg) {
    log.info("XXX onCloseChartCb");
  }

};
