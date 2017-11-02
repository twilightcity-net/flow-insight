const { app, BrowserWindow } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("./WindowManagerHelper"),
  LoadingWindow = require("../windows/LoadingWindow"),
  ConsoleWindow = require("../windows/ConsoleWindow"),
  BugReportWindow = require("../windows/BugReportWindow");

/*
 * This class is used to manage the view, state, and display of each
 * of our windows in our application. windows are stored in an array
 * and are dynamically loaded.
 */
module.exports = class WindowManager {
  constructor() {
    log.info("[WindowManager] created : okay");
    this.windows = [];
  }

  /*
	 * Gets the window from the global array of windows
	 */
  getWindow(name) {
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === name) {
        return this.windows[i];
      }
    }
    return null;
  }

  /*
	 * Gets the url to load in the window based on a name of a view
	 */
  getWindowViewURL(viewName) {
    if (isDev) {
      return "http://localhost:3000?" + viewName;
    }
    let filePath = `${path.join(
      app.getAppPath(),
      Util.getAppRootDir(),
      "/index.html?" + viewName
    )}`;
    log.info(">>>>" + filePath);
    return "file://" + filePath;
  }

  /*
	 * Loads a view into a window and creates its event handlers
	 */
  loadWindow(window) {
    log.info("[WindowManager] Load window : " + window.name);
    window.window.loadURL(window.url);
    window.window.on("ready-to-show", () => {
      if (window.autoShow) this.openWindow(window);
    });
    window.window.on("closed", () => {
      this.destroyWindow(window);
    });
  }

  /*
	 * Opens a window based on its object reference
	 */
  openWindow(window) {
    log.info("[WindowManager] Open window : " + window.name);
    window.window.show();
    window.window.focus();
    Util.showDevTools(window.window);
  }

  /*
	 * closes the window with and option to destroy the window from
	 * Memory
	 */
  closeWindow(window, destroy) {
    log.info("[WindowManager] Close window : " + window.name);
    window.window.hide();
    if (destroy) {
      this.destroyWindow(window);
    }
  }

  /*
	 * Hids the window, and removes it from the Array of windows. This
	 * is needed so that we do not leak memory or waste local resources.
	 */
  destroyWindow(window) {
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === window.name) {
        log.info("[WindowManager] Destroy window : " + window.name);
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
  createWindow(name) {
    log.info("[WindowManager] Create window : " + name);
    let window = this.getWindow(name);
    if (!window) {
      log.info("[WindowManager] make new window -> " + name);
      window = this.getWindowClassFromName(name);
    }
    this.loadWindow(window);
    this.windows.push(window);
    return window;
  }

  /*
	 * Toggles open / close of windows withing our Array
	 */
  toggleWindow(window) {
    log.info("[WindowManager] Toggle window : " + window.name);
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
  getWindowClassFromName(name) {
    // TODO this should use a factory design
    switch (name) {
      case WindowManagerHelper.WindowNames.LOADING:
        return new LoadingWindow();
      case WindowManagerHelper.WindowNames.CONSOLE:
        return new ConsoleWindow();
      case WindowManagerHelper.WindowNames.BUGREPORT:
        return new BugReportWindow();
      default:
        return null;
    }
  }
};
