const { BrowserWindow } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  ViewManagerHelper = require("../managers/ViewManagerHelper"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../events/EventFactory");

/**
 * A floating IFM chart window. Draggable around the screen, and detached from the console.
 * Can open multiple windows of this type.
 */
module.exports = class ChartWindow {
  constructor(windowName, arg) {
    this.arg = arg;
    this.chartIndex = this.arg.chartIndex;
    this.name = windowName;
    this.view = ViewManagerHelper.ViewNames.CHART;
    this.url = global.App.WindowManager.getWindowViewURL(
      this.view, arg
    );
    this.icon = Util.getAppIcon("icon.ico");
    this.display = global.App.WindowManager.getDisplay();
    this.autoShow = true;
    this.window = new BrowserWindow({
      name: this.name,
      width: Math.floor(this.display.workAreaSize.width * 0.75),
      height:  Math.floor(this.display.workAreaSize.height / 2 * 0.90),
      x: Math.floor(this.display.workAreaSize.width * 0.25) - (this.chartIndex * 5),
      y: Math.floor(this.display.workAreaSize.height / 2 * 1.1 + (this.chartIndex * 5)),
      resizable: false,
      movable: true,
      frame: false,
      show: false,
      icon: this.icon,
      backgroundColor: "#ffffff",
      fullscreenable: false,
      webPreferences: {
        toolbar: false,
        nodeIntegration: true,
      },
    });
    this.window.name = this.name;
    this.window.setMenu(null);
    this.window.on("show", () => this.onShowCb());
    this.window.on("closed", () => this.onClosedCb());
    this.events = {
      shown: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHART_SHOWN,
        this
      ),
      closed: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CHART_CLOSED,
        this
      ),
    };
  }

  onShowCb() {
    log.info("[ChartWindow] opened window");
    this.events.shown.dispatch(this.arg);
  }

  onClosedCb() {
    log.info("[ChartWindow] closed window");
    global.App.ChartWindowManager.closeChartWindow(this.arg);
  }
};
