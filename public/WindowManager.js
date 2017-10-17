const { app, BrowserWindow } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("./Util"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  LoadingWindow = require("./LoadingWindow"),
  ConsoleWindow = require("./ConsoleWindow");

/*
 * This class is used to manage the view, state, and display of each
 * of our windows in our application. windows are stored in an array
 * and are dynamically loaded.
 */
module.exports = class WindowManager {
  /*
   * initialization method that creates an array to store windows in
   */
  static init() {
    log.info("Initialize WindowManager");
    this.windows = [];
  }

  /*
   * Static array containing all of our windows the app uses
   */
  static get Windows() {
    return this.windows;
  }

  /*
	 * static helper enum subclass to store window names
	 */
  static get WindowNames() {
    let appName = "metaos-";
    return {
      LOADING: appName + ViewManagerHelper.ViewNames.LOADING,
      CONSOLE: appName + ViewManagerHelper.ViewNames.CONSOLE
    };
  }

  /*
	 * Gets the window from the global array of windows
	 */
  static getWindow(name) {
    this.windows.forEach(function(item, index, array) {
      if (this.windows[i].name == name) {
        return this.windows[i];
      }
    });
    return null;
  }

  /*
	 * Gets the url to load in the window based on a name of a view
	 */
  static getWindowViewURL(viewName) {
    if (isDev) {
      return "http://localhost:3000?" + viewName;
    }
    let filePath = `${path.join(
      app.getAppPath(),
      __dirname,
      "/index.html?" + viewName
    )}`;
    return "file://" + filePath;
  }

  /*
	 * Loads a view into a window and creates its event handlers
	 */
  static loadWindow(window) {
    log.info("Load window : " + window.name);
    window.window.loadURL(window.url);
    window.window.on("ready-to-show", () => {
      this.openWindow(window);
    });
    window.window.on("closed", () => {
      this.destroyWindow(window);
    });
  }

  /*
	 * Opens a window based on its object reference
	 */
  static openWindow(window) {
    log.info("Open window : " + window.name);
    window.window.show();
    window.window.focus();
    Util.showDevTools(window.window);
  }

  /*
	 * closes the window with and option to destroy the window from
	 * Memory
	 */
  static closeWindow(window, destroy) {
    log.info("Close window : " + window.name);
    window.window.hide();
    if (destroy) {
      this.destroyWindow(window);
    }
  }

  /*
	 * Hids the window, and removes it from the Array of windows. This
	 * is needed so that we do not leak memory or waste local resources.
	 */
  static destroyWindow(window) {
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name == window.name) {
        log.info("Destroy window : " + window.name);
        return this.windows.splice(i, 1);
      }
    }
    return null;
  }

  /*
	 * creates a new window based off the string name of the window.
	 * After creating the window, it is added to a global array to
	 * be reused.
	 */
  static createWindow(name) {
    log.info("Create window : " + name);
    let window = this.getWindow(name);
    if (!window) {
      window = this.getWindowClassFromName(name);
    }
    this.loadWindow(window);
    this.Windows.push(window);
  }

  /*
	 * Toggles open / close of windows withing our Array
	 */
  static toggleWindow(window) {
    log.info("Toggle window : " + window.name);
    if (window.window.isVisible()) {
      openWindow(window);
    } else {
      closeWindow(window);
    }
  }

  /*
	 * This is a helper method that returns the class of a window
	 * based on the literal string name of the class. A better way to do
	 * is to figure out how to use some type of reflection with a 
	 * factory class.
	 *
	 * Need to add a new case for each window we wish to open
	 */
  static getWindowClassFromName(name) {
    // TODO this should use a factory design
    switch (name) {
      case this.WindowNames.LOADING:
        return new LoadingWindow(this);
      case this.WindowNames.CONSOLE:
        return new ConsoleWindow(this);
      default:
        return null;
    }
  }

  /*
	 * Stuff that you need to add when making a new window. These are high 
	 * level API calls for other classes to use.
	 */
  static createWindowLoading() {
    let name = this.WindowNames.LOADING;
    this.createWindow(name);
  }

  static createWindowConsole() {
    let name = this.WindowNames.CONSOLE;
    this.createWindow(name);
  }
};
