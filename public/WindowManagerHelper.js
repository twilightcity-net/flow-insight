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
};
