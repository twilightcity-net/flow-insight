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
  App;
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
      INVITATION: "tc-" + ViewManagerHelper.ViewNames.INVITATION,
      ORGSWITCH: "tc-" + ViewManagerHelper.ViewNames.ORGSWITCH,
      MOOVIE: "tc-" + ViewManagerHelper.ViewNames.MOOVIE,
      MESSAGE: "tc-" + ViewManagerHelper.ViewNames.MESSAGE,
      GETSTARTED: "tc-"+ ViewManagerHelper.ViewNames.GETSTARTED,
      FERVIE: "tc-"+ ViewManagerHelper.ViewNames.FERVIE,
      PLUGIN: "tc-" + ViewManagerHelper.ViewNames.PLUGIN,
      MODULE: "tc-" + ViewManagerHelper.ViewNames.MODULE,
      STATUS: "tc-" + ViewManagerHelper.ViewNames.STATUS
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
   * creates new fervie popup window
   * @returns {*}
   */
  static createFervieWindow() {
    let windowClassName = WindowManagerHelper.WindowNames.FERVIE;

    return global.App.WindowManager.createWindow(
      windowClassName,
      windowClassName
    );
  }

  /**
   * Closes the fervie window
   * @returns {*}
   */
  static closeFervieWindow() {
    let windowClassName = WindowManagerHelper.WindowNames.FERVIE;

    return WindowManagerHelper.closeWindow(windowClassName);
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
   * forces all console and child windows to stay on top
   * @returns {*}
   */
  static forceConsoleWindowOnTop() {
    //WindowManagerHelper.forceWindowOnTop(WindowManagerHelper.WindowNames.HOTKEY);
    WindowManagerHelper.forceWindowOnTop(WindowManagerHelper.WindowNames.CONSOLE);
  }

  /**
   * relieves all console and child windows from having to stay on top
   * @returns {*}
   */
  static relieveConsoleFromAlwaysOnTop() {
    WindowManagerHelper.relieveWindowOnTop(WindowManagerHelper.WindowNames.CONSOLE);
   // WindowManagerHelper.forceWindowOnTop(WindowManagerHelper.WindowNames.HOTKEY);
  }

  static forceWindowOnTop(windowName) {
    const window = global.App.WindowManager.getWindow(windowName);
    if (window) {
      window.window.setAlwaysOnTop(true, "screen-saver");
    }
  }

  static relieveWindowOnTop(windowName) {
    const window = global.App.WindowManager.getWindow(windowName);
    if (window) {
      window.window.setAlwaysOnTop(false, "screen-saver");
    }
  }



  /**
   * creates new console window
   * @returns {*}
   */
  static relieveHotkeyFromAlwaysOnTop() {
    const windowName = WindowManagerHelper.WindowNames.HOTKEY;
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
   * creates new window for using an invitation key
   * @returns {*}
   */
  static createWindowUseInvitationKey() {
    let windowName = WindowManagerHelper.WindowNames.INVITATION;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new window for switching the logged in org
   * @returns {*}
   */
  static createWindowOrgSwitch() {
    let windowName = WindowManagerHelper.WindowNames.ORGSWITCH;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * creates new active status window window
   * @returns {*}
   */
  static createActiveStatusWindow() {
    let windowName = WindowManagerHelper.WindowNames.STATUS;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName
    );
  }

  /**
   * closes the active status window
   * @returns {*}
   */
  static closeActiveStatusWindow() {
    let windowName = WindowManagerHelper.WindowNames.STATUS;
    global.App.WindowManager.closeWindowByName(windowName);
  }

  /**
   * creates new window for plugin registration
   * @returns {*}
   */
  static createPluginRegistrationWindow(arg) {
    let windowName = WindowManagerHelper.WindowNames.PLUGIN;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName,
      arg
    );
  }

  /**
   * creates new window for loading a module configuration
   * @returns {*}
   */
  static createLoadModuleConfigWindow(arg) {
    let windowName = WindowManagerHelper.WindowNames.MODULE;
    return global.App.WindowManager.createWindow(
      windowName,
      windowName,
      arg
    );
  }

  /**
   * closes module configuration window
   * @returns {*}
   */
  static closeLoadModuleConfigWindow() {
    let windowName = WindowManagerHelper.WindowNames.MODULE;
    global.App.WindowManager.closeWindowByName(windowName);
  }

  /**
   * closes org switcher window
   * @returns {*}
   */
  static closeWindowOrgSwitch() {
    let windowName = WindowManagerHelper.WindowNames.ORGSWITCH;
    global.App.WindowManager.closeWindowByName(windowName);
  }

  /**
   * closes plugin registration window
   * @returns {*}
   */
  static closePluginRegistrationWindow() {
    let windowName = WindowManagerHelper.WindowNames.PLUGIN;
    global.App.WindowManager.closeWindowByName(windowName);
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
   * closes plugin registration dialog window
   * @returns {*}
   */
  static closeWindowPluginDialog() {
    let windowName = WindowManagerHelper.WindowNames.PLUGIN;
    global.App.WindowManager.closeWindowByName(windowName);
  }


  /**
   * closes the use invitation key window
   * @returns {*}
   */
  static closeWindowInvitationKey() {
    let windowName = WindowManagerHelper.WindowNames.INVITATION;
    global.App.WindowManager.closeWindowByName(windowName);
  }


  static focusConsoleWindowIfVisible() {
    const windowName = WindowManagerHelper.WindowNames.CONSOLE;
    const window = global.App.WindowManager.getWindow(windowName);

    if (window && window.isShown()) {
      window.window.show();
      window.window.focus();
    }
  }

  static unhideDock() {
    if (is_mac) {
     //this works around the dock action de-focusing the console in the transition
      WindowManagerHelper.forceConsoleWindowOnTop();
      log.info("show dock..");
      setTimeout(() => {
        app.dock.show().then(() => {
          setTimeout(() => {
            WindowManagerHelper.relieveConsoleFromAlwaysOnTop();
          }, 333);
        });
      }, 333);
    }
  }

  /**
   * Hide the window bar dock while keeping the console window on top.
   * Normally, focus shifts to the app behind the main app,
   * which the dock is hidden.  This keeps the console app, temporarily on top.
   */
  static hideDockWhileConsoleStaysOnTop() {
    if (is_mac) {
      //this works around the dock hiding de-focusing the console in the transition
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

