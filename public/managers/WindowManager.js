const { app, BrowserWindow } = require("electron"),
  debug = require("electron-debug")({ showDevTools: false }),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("./EventFactory"),
  { ShortcutManager } = require("./ShortcutManager"),
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
    log.info("[WindowManager] created -> okay");
    this.windows = [];
    this.events = {
      focusWindow: EventFactory.createEvent(
        EventFactory.Types.WINDOW_FOCUS,
        this,
        (event, arg) => this.onFocusWindowCb(event, arg)
      ),
      blurWindow: EventFactory.createEvent(
        EventFactory.Types.WINDOW_BLUR,
        this,
        (event, arg) => this.onBlurWindowCb(event, arg)
      ),
      shortcutsRecieved: EventFactory.createEvent(
        EventFactory.Types.SHORTCUTS_RECIEVED,
        this,
        (event, arg) => this.onShortcutsRecievedCb(event, arg)
      ),
      consoleShowHide: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE
      )
    };
  }

  /*
   * callback for native window focus event. Activates any shortcuts associated
   * to that window
   */
  onFocusWindowCb(event, arg) {
    log.info("[WindowManager] focus window -> " + arg.sender.name);
    ShortcutManager.activateWindowShortcuts(arg.sender);
  }

  /*
   * callback for native window blur event. Deactivates any shortcuts associated
   * to that window
   */
  onBlurWindowCb(event, arg) {
    log.info("[WindowManager] blur window -> " + arg.sender.name);
    ShortcutManager.deactivateWindowShortcuts(arg.sender);
  }

  /*
   * callback to handle our console shortcut event
   */
  onShortcutsRecievedCb(event, arg) {
    log.info("[WindowManager] shortcut recieved -> shortcutsRecieved : " + arg);
    if (ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE === arg.name) {
      this.events.consoleShowHide.dispatch();
    }
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
    log.info("[WindowManager] load window -> " + window.name);
    window.window.loadURL(window.url);
    window.window.on("ready-to-show", () => {
      if (window.autoShow) this.openWindow(window);
    });
  }

  /*
	 * Opens a window based on its object reference
	 */
  openWindow(window) {
    log.info("[WindowManager] open window -> " + window.name);
    window.window.show();
    window.window.focus();
  }

  /*
	 * closes the window with and option to destroy the window from
	 * Memory
	 */
  closeWindow(window, destroy) {
    log.info("[WindowManager] hide window -> " + window.name);
    window.window.hide();
    if (destroy) {
      log.info("[WindowManager] close window -> " + window.name);
      window.window.close();
      window = this.destroyWindow(window);
    }
  }

  /*
	 * Hids the window, and removes it from the Array of windows. This
	 * is needed so that we do not leak memory or waste local resources.
   * Window name are unique.. so only one per windows array
	 */
  destroyWindow(window) {
    log.info("[WindowManager] destroy window -> " + window.name);
    Util.inspect(this.windows);
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === window.name) {
        log.info("[WindowManager] unregister window -> " + window.name);
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
    log.info("[WindowManager] create window -> " + name);
    let window = this.getWindow(name);
    if (!window) {
      log.info("[WindowManager] └> get or make window -> " + name);
      window = this.getWindowClassFromName(name);
      window.window.on("focus", event => {
        this.events.focusWindow.dispatch(event);
      });
      window.window.on("blur", event => {
        this.events.blurWindow.dispatch(event);
      });
    }
    this.loadWindow(window);
    this.windows.push(window);
    return window;
  }

  /*
	 * Toggles open / close of windows withing our Array
	 */
  toggleWindow(window) {
    log.info("[WindowManager] toggle window -> " + window.name);
    if (!window.window.isVisible()) {
      this.openWindow(window);
    } else {
      this.closeWindow(window);
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
