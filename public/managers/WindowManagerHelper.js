const ViewManagerHelper = require("./ViewManagerHelper");
const log = require("electron-log");
const {app} = require("electron");

const is_mac = process.platform==='darwin';

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
      ACTIVATOR: "tc-" + ViewManagerHelper.ViewNames.ACTIVATOR,
      CONSOLE: "tc-" + ViewManagerHelper.ViewNames.CONSOLE,
      CHART: "tc-" + ViewManagerHelper.ViewNames.CHART,
      HOTKEY: "tc-" + ViewManagerHelper.ViewNames.HOTKEY,
      MOOVIE: "tc-" + ViewManagerHelper.ViewNames.MOOVIE,
      MESSAGE: "tc-" + ViewManagerHelper.ViewNames.MESSAGE,
      GETSTARTED: "tc-"+ ViewManagerHelper.ViewNames.GETSTARTED
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

  /**
   * creates new getting started popup window
   * @returns {*}
   */
  static createGettingStartedWindow() {
    let windowClassName = WindowManagerHelper.WindowNames.GETSTARTED;

    return global.App.WindowManager.createWindow(
      windowClassName,
      windowClassName
    );
  }

  /**
   * Closes the getting started window
   * @returns {*}
   */
  static closeGettingStartedWindow() {
    let windowClassName = WindowManagerHelper.WindowNames.GETSTARTED;

    return WindowManagerHelper.closeWindow(windowClassName);
  }

  static closeWindow(windowName) {
    return global.App.WindowManager.closeWindowByName(
      windowName
    );
  }

  static closeMoovieWindow() {
    return global.App.WindowManager.closeWindowByName(
      WindowManagerHelper.WindowNames.MOOVIE
    );
  }

  /**
   * creates new moovie popout window
   * @returns {*}
   */
  static createMoovieWindow(arg) {
    let windowClassName = WindowManagerHelper.WindowNames.MOOVIE;

    return global.App.WindowManager.createWindow(
      windowClassName,
      windowClassName,
      arg
    );
  }

  /**
   * Returns true if the specified window with name is open
   * @param windowName
   */
  static isMoovieWindowOpen() {
    const window = global.App.WindowManager.getWindow(WindowManagerHelper.WindowNames.MOOVIE);
    console.log(window);
    return !!window;
  }

  /**
   * creates new direct message slide window
   * @returns {*}
   */
  static createDMWindow(windowName, arg) {
    let windowClassName = WindowManagerHelper.WindowNames.MESSAGE;

    return global.App.WindowManager.createWindow(
      windowName,
      windowClassName,
      arg
    );
  }

  /**
   * reloads an existing dm window
   * @returns {*}
   */
  static reloadDMWindow(window, arg) {
    return global.App.WindowManager.loadWindow(window, arg);
  }

  /**
   * creates new loading window
   * @returns {*}
   */
  static createWindowLoading() {
    let windowName = WindowManagerHelper.WindowNames.LOADING;
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
    let windowName = WindowManagerHelper.WindowNames.ACTIVATOR;
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
    let windowName = WindowManagerHelper.WindowNames.CONSOLE;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new console window
   * @returns {*}
   */
  static forceConsoleWindowOnTop() {
    const windowName = WindowManagerHelper.WindowNames.CONSOLE;
    const window = global.App.WindowManager.getWindow(windowName);
    window.forceOnTop();
  }

  /**
   * creates new console window
   * @returns {*}
   */
  static relieveConsoleFromAlwaysOnTop() {
    const windowName = WindowManagerHelper.WindowNames.CONSOLE;
    const window = global.App.WindowManager.getWindow(windowName);
    window.relieveOnTop();
  }

  /**
   * creates new hotkey config window
   * @returns {*}
   */
  static createWindowHotkeyConfig() {
    let windowName = WindowManagerHelper.WindowNames.HOTKEY;
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
    let windowName = WindowManagerHelper.WindowNames.HOTKEY;
    global.App.WindowManager.closeWindowByName(windowName);
  }


  /**
   * Hide the window bar dock while keeping the console window on top.
   * Normally, focus shifts to the app behind the main app,
   * which the dock is hidden.  This keeps the console app, temporarily on top.
   */
  static hideDockWhileConsoleStaysOnTop() {
    if (is_mac) {
      //required to get the chat windows to work in full screen
      WindowManagerHelper.forceConsoleWindowOnTop();
      log.info("hide dock..");
      setTimeout(() => {
        app.dock.hide();
        setTimeout(() => {
          WindowManagerHelper.relieveConsoleFromAlwaysOnTop();
        }, 333);
      }, 333);
    }
  }

};

