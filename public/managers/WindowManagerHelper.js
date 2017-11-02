const ViewManagerHelper = require("./ViewManagerHelper");
/*
 * Simpler helper function for the ViewManager used to store the
 * names of the applications various views
 */

module.exports = class WindowManagerHelper {
  /*
	 * Enum subclass to store view names in
	 */
  static get WindowNames() {
    return {
      LOADING: "metaos-" + ViewManagerHelper.ViewNames.LOADING,
      CONSOLE: "metaos-" + ViewManagerHelper.ViewNames.CONSOLE,
      BUGREPORT: "metaos-" + ViewManagerHelper.ViewNames.BUGREPORT
    };
  }

  /*
   * Stuff that you need to add when making a new window. These are high 
   * level API calls for other classes to use.
   */
  static createWindowLoading() {
    let name = WindowManagerHelper.WindowNames.LOADING;
    return global.App.WindowManager.createWindow(name);
  }

  static createWindowConsole() {
    let name = WindowManagerHelper.WindowNames.CONSOLE;
    return global.App.WindowManager.createWindow(name);
  }

  static createWindowBugReport() {
    const name = WindowManagerHelper.WindowNames.BUGREPORT;
    return global.App.WindowManager.createWindow(name);
  }
};
