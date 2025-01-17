const electron = require("electron"),
  { app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  {
    ShortcutManager,
  } = require("../managers/ShortcutManager"),
  WindowManagerHelper = require("./WindowManagerHelper"),
  LoadingWindow = require("../windows/LoadingWindow"),
  ActivatorWindow = require("../windows/ActivatorWindow"),
  ConsoleWindow = require("../windows/ConsoleWindow"),
  ChartWindow = require("../windows/ChartWindow");
const HotkeyConfigWindow = require("../windows/HotkeyConfigWindow");
const MoovieWindow = require("../windows/MoovieWindow");
const MessageWindow = require("../windows/MessageWindow");
const GettingStartedWindow = require("../windows/GettingStartedWindow");
const FervieWindow = require("../windows/FervieWindow");
const InvitationKeyWindow = require("../windows/InvitationKeyWindow");
const OrgSwitcherWindow = require("../windows/OrgSwitcherWindow");
const PluginRegistrationWindow = require("../windows/PluginRegistrationWindow");
const LoadModuleConfigWindow = require("../windows/LoadModuleConfigWindow");
const ActiveStatusWindow = require("../windows/ActiveStatusWindow");
/**
 * This class is used to manage the view, state, and display of each
 * of our windows in our application. windows are stored in an array
 * and are dynamically loaded.
 * @type {WindowManager}
 */
class WindowManager {
  /**
   * builds the window manager in the global static scope
   */
  constructor() {
    log.info(
      "[WindowManager] created -> display : " +
        JSON.stringify(this.getDisplay())
    );
    this.windows = [];
    this.lastFocusWindowName = null;
    this.lastBlurWindowName = null;
    this.events = {
      shortcutsRecieved: EventFactory.createEvent(
        EventFactory.Types.SHORTCUTS_RECIEVED,
        this,
        (event, arg) =>
          this.onShortcutsRecievedCb(event, arg)
      ),
      hideConsole: EventFactory.createEvent(
        EventFactory.Types.WINDOW_CONSOLE_SHOW_HIDE
      )
    };
  }

  /**
   * callback for native window focus event. Activates any shortcuts associated
   * to that window
   * @param arg
   */
  onFocusWindowCb(arg, window) {
    log.info(
      "[WindowManager] focus window -> " + window.name
    );
    global.App.ShortcutManager.activateWindowShortcuts(
      window
    );
    global.App.WindowManager.lastFocusWindowName =
      window.name;
  }

  /**
   * callback for native window blur event. Deactivates any shortcuts associated
   * to that window
   * @param arg
   */
  onBlurWindowCb(arg, window) {
    log.info(
      "[WindowManager] blur window -> " +window.name
    );
    global.App.WindowManager.lastBlurWindowName =
      window.name;
    global.App.ShortcutManager.deactivateWindowShortcuts(
      window
    );
    if (
      window.name ===
      WindowManagerHelper.WindowNames.CONSOLE
    ) {
      // this.handleHideConsoleEvent(1);
    }
  }

  /**
   * callback to handle our console shortcut event
   * @param event
   * @param arg - the window event that dispatched the event
   */
  onShortcutsRecievedCb(event, arg) {
    if (ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE === arg ||
      ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE_ALT === arg) {
      this.handleHideConsoleEvent();
    } else if (ShortcutManager.Names.GLOBAL_WINDOW_DEV_MODE === arg) {
      log.info(
        "[WindowManager] open dev mode -> " +
          global.App.WindowManager.lastFocusWindowName
      );
      let win = this.getWindow(global.App.WindowManager.lastFocusWindowName);
      if (win) {
        win.window.webContents.openDevTools({
          mode: "undocked",
        });
      }
    }
  }

  /**
   * handles hiding the console window on shown event
   * @param windowState
   */
  handleHideConsoleEvent(windowState) {
    let win = this.getWindow(
      WindowManagerHelper.WindowNames.CONSOLE
    );
    if (win.consoleShortcut.pressedState === 1) return;
    win.consoleShortcut.pressedState = 1;
    setTimeout(() => {
      win.consoleShortcut.pressedState = 0;
    }, win.consoleShortcut.delay);
    if (windowState) {
      this.events.hideConsole.dispatch({
        showHideFlag: windowState,
      });
    } else {
      this.events.hideConsole.dispatch({
        showHideFlag: win.state,
      });
    }
  }

  /**
   * helper function to get the arrauy of all displays in screen
   * @returns {Electron.Display[]}
   */
  getDisplays() {
    return electron.screen.getAllDisplays();
  }

  /**
   * returns the stored display index or returns the primary if nothings is set,
   * and updates the settings file. we assume the primary display is set to 0 for default
   */
  getDisplay() {
    let displays = electron.screen.getAllDisplays();
    let primaryDisplay =
      electron.screen.getPrimaryDisplay();
    if (displays.length < 2) {
      return primaryDisplay;
    }
    let defaultDisplay =
      global.App.AppSettings.getDisplayIndex();
    if (
      defaultDisplay &&
      defaultDisplay < displays.length
    ) {
      return displays[defaultDisplay];
    }
    global.App.AppSettings.setDisplayIndex(0);
    return primaryDisplay;
  }

  /**
   * Gets the window from the global array of windows
   * @param name
   * @returns {null|*}
   */
  getWindow(name) {
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === name) {
        return this.windows[i];
      }
    }
    return null;
  }

  /**
   * Gets the url to load in the window based on a name of a view
   * @param viewName
   * @param arg json parameters
   * @returns {string}
   */
  getWindowViewURL(viewName, arg) {
    let argsString = "";
    if (arg) {
      for (let key in arg) {
        if (arg.hasOwnProperty(key)) {
          argsString += "&" + key + "=" + arg[key];
        }
      }
    }

    if (isDev) {
      return (
        "http://localhost:3000?view=" +
        viewName +
        argsString
      );
    }
    let filePath = `${path.join(
      app.getAppPath(),
      Util.getAppRootDir(),
      "/index.html?view=" +
        viewName +
        argsString
    )}`;
    return "file://" + filePath;
  }

  /**
   * Loads a view into a window and creates its event handlers
   * @param window
   * @param arg to pass to the window
   */
  loadWindow(window, arg) {
    log.info("[WindowManager] load window -> " + window.name);

    let newUrl = this.getWindowViewURL(window.view, arg);
    window.window.loadURL(newUrl);

    window.window.on("ready-to-show", () => {
      if (window.autoShow) {
        var that = this;
        setTimeout(function () {
          that.openWindow(window);
       }, 500);
      }
    });
  }

  /**
   * Loads a view into a window and creates its event handlers
   * @param window
   * @param arg to pass to the window
   */
  refreshWindowUrl(window, arg) {
    log.info("[WindowManager] refresh window -> " + window.name);

    //this needs to load a fresh url even if it's reloading the window
    let newUrl = this.getWindowViewURL(window.view, arg);
    window.window.loadURL(newUrl);
  }

  /**
   * Opens a window based on its object reference
   * @param window
   */
  openWindow(window) {
    log.info("[WindowManager] open window -> " + window.name);
    if (!window.window.isDestroyed()) {
      window.window.show();
      window.window.focus();
    }
  }

  /**
   * Close the window with the specified name
   * @param windowName
   */
  closeWindowByName(windowName) {
    log.info(
      "[WindowManager] close window by name -> " +
        windowName
    );

    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === windowName) {
        log.info(
          "[WindowManager] closing window -> " + windowName
        );
        this.closeWindow(this.windows[i], true);
      }
    }
  }

  /**
   * closes the window with and option to destroy the window from
   * Memory
   * @param window
   * @param destroy
   */
  closeWindow(window, destroy) {
    log.info(
      "[WindowManager] hide window -> " + window.name
    );

    if (!window.window.isDestroyed()) {
      window.window.hide();
    }

    if (destroy) {
      log.info(
        "[WindowManager] close window -> " + window.name
      );
      if (!window.window.isDestroyed()) {
        window.window.close();
      }
      window = this.destroyWindow(window);
    }
  }

  /**
   * Hids the window, and removes it from the Array of windows. This
   * is needed so that we do not leak memory or waste local resources.
   * Window name are unique.. so only one per windows array
   * @param window
   * @returns {null|T[]}
   */
  destroyWindow(window) {
    log.info(
      "[WindowManager] destroy window -> " + window.name
    );
    for (var i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].name === window.name) {
        log.info(
          "[WindowManager] unregister window -> " +
            window.name
        );
        return this.windows.splice(i, 1);
      }
    }
    return null;
  }

  /**
   * destroys all of the windows in the window manager after they are closed.
   */
  destroyAllWindows() {
    log.info(
      "[WindowManager] destroy all windows {" +
        this.windows.length +
        "]"
    );
    for (var i = this.windows.length - 1; i >= 0; i--) {
      this.closeWindow(this.windows[i], true);
    }
    this.windows = [];
  }

  /**
   * creates a new window based off the string name of the window.
   * After creating the window, it is added to a global array to
   * be reused.
   * @param windowName
   * @param windowClassName
   * @param arg to be sent to the window
   * @returns {*|null}
   */
  createWindow(windowName, windowClassName, arg) {
    log.info(
      "[WindowManager] create window -> " + windowName
    );
    let window = this.getWindow(windowName);
    if (!window) {
      log.info(
        "[WindowManager] └> get or make window -> " +
          windowName
      );
      window = this.getWindowInstanceFromName(
        windowName,
        windowClassName,
        arg
      );
      window.window.on("focus", (event) => {
        this.onFocusWindowCb(event, window.window);
      });
      window.window.on("blur", (event) => {
        this.onBlurWindowCb(event, window.window);
      });
      this.windows.push(window);

      this.loadWindow(window, arg);
    } else {
      //if window already exists creating the window should focus it
      window.window.focus();
      this.refreshWindowUrl(window, arg);
    }
    return window;
  }

  /**
   * This is a helper method that returns the class of a window
   * based on the literal string name of the class. A better way to do
   * is to figure out how to use some type of reflection with a
   * factory class.
   * Need to add a new case for each window we wish to open
   * @param windowName
   * @param windowClassName
   * @param arg to be sent to the window
   * @returns {LoadingWindow|null|ActivatorWindow|ConsoleWindow}
   */
  getWindowInstanceFromName(
    windowName,
    windowClassName,
    arg
  ) {
    switch (windowClassName) {
      case WindowManagerHelper.WindowNames.LOADING:
        return new LoadingWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.ACTIVATOR:
        return new ActivatorWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.CONSOLE:
        return new ConsoleWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.CHART:
        return new ChartWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.HOTKEY:
        return new HotkeyConfigWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.INVITATION:
        return new InvitationKeyWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.ORGSWITCH:
        return new OrgSwitcherWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.MOOVIE:
        return new MoovieWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.MESSAGE:
        return new MessageWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.GETSTARTED:
        return new GettingStartedWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.FERVIE:
        return new FervieWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.PLUGIN:
        return new PluginRegistrationWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.MODULE:
        return new LoadModuleConfigWindow(windowName, arg);
      case WindowManagerHelper.WindowNames.STATUS:
        return new ActiveStatusWindow(windowName, arg);
      default:
        return null;
    }
  }
}

module.exports = WindowManager;
