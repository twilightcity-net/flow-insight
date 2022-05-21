const ViewManagerHelper = require("./ViewManagerHelper");

/**
 * Simpler helper function for the ViewManager used to store the
 * names of the applications various views
 * @type {WindowManagerHelper}
 */
module.exports = class WindowManagerHelper {
  /**
   * Enum subclass to store view names in
   * @returns {enum}
   * @constructor
   */
  static get WindowNames() {
    return {
      LOADING: "tc-" + ViewManagerHelper.ViewNames.LOADING,
      ACTIVATOR:
        "tc-" + ViewManagerHelper.ViewNames.ACTIVATOR,
      CONSOLE: "tc-" + ViewManagerHelper.ViewNames.CONSOLE,
      CHART: "tc-" + ViewManagerHelper.ViewNames.CHART,
      HOTKEY: "tc-" + ViewManagerHelper.ViewNames.HOTKEY,
      MOOVIE: "tc-" + ViewManagerHelper.ViewNames.MOOVIE
    };
  }

  /**
   * creates new chart popout window
   * @returns {*}
   */
  static createChartWindow(chartWindowName, arg) {
    let windowClassName =
      WindowManagerHelper.WindowNames.CHART;

    return global.App.WindowManager.createWindow(
      chartWindowName,
      windowClassName,
      arg
    );
  }

  static closeWindow(windowName) {
    return global.App.WindowManager.closeWindowByName(
      windowName
    );
  }

  /**
   * creates new moovie popout window
   * @returns {*}
   */
  static createMoovieWindow(moovieWindowName, arg) {
    let windowClassName =
      WindowManagerHelper.WindowNames.MOOVIE;

    return global.App.WindowManager.createWindow(
      moovieWindowName,
      windowClassName,
      arg
    );
  }

  /**
   * creates new loading window
   * @returns {*}
   */
  static createWindowLoading() {
    let windowName =
      WindowManagerHelper.WindowNames.LOADING;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new activator window
   * @returns {*}
   */
  static createWindowActivator() {
    let windowName =
      WindowManagerHelper.WindowNames.ACTIVATOR;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new console window
   * @returns {*}
   */
  static createWindowConsole() {
    let windowName =
      WindowManagerHelper.WindowNames.CONSOLE;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new hotkey config window
   * @returns {*}
   */
  static createWindowHotkeyConfig() {
    let windowName =
      WindowManagerHelper.WindowNames.HOTKEY;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * closes hotkey config window
   * @returns {*}
   */
  static closeWindowHotkeyConfig() {
    let windowName =
      WindowManagerHelper.WindowNames.HOTKEY;
    global.App.WindowManager.closeWindowByName(windowName);
  }
};
