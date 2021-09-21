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
      CONSOLE: "tc-" + ViewManagerHelper.ViewNames.CONSOLE
    };
  }

  /**
   * creates new loading window
   * @returns {*}
   */
  static createWindowLoading() {
    let name = WindowManagerHelper.WindowNames.LOADING;
    return global.App.WindowManager.createWindow(name);
  }

  /**
   * creates new activator window
   * @returns {*}
   */
  static createWindowActivator() {
    let name = WindowManagerHelper.WindowNames.ACTIVATOR;
    return global.App.WindowManager.createWindow(name);
  }

  /**
   * creates new console window
   * @returns {*}
   */
  static createWindowConsole() {
    let name = WindowManagerHelper.WindowNames.CONSOLE;
    return global.App.WindowManager.createWindow(name);
  }
};
