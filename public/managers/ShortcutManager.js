const { globalShortcut } = require("electron"),
  log = require("electron-log"),
  AppError = require("../app/AppError"),
  { EventManager } = require("../events/EventManager"),
  EventFactory = require("../events/EventFactory");

/**
 * an object class used to instantiate new shortcuts with events. These can
 * be global, a specific window, or within a local scope of a window (meaning
 * outside of this manager class -> quick and dirty) There is no current way
 * to remove a shortcut or deactivate it.. needs to be done as it is needed.
 * @ref {https://electronjs.org/docs/api/accelerator}
 */
class Shortcut {
  constructor(name, accelerator, scope, callback, window) {
    this.name = name;
    this.accelerator = accelerator;
    this.window = window;
    this.scope = scope;
    this.callback = callback
      ? callback.bind(this.scope)
      : callback;
    global.App.ShortcutManager.registerShortcut(this);
  }

  isGlobal() {
    return !this.window;
  }
}

/**
 * base error class for any specific type of shortcut
 */
class ShortcutError extends AppError {
  constructor(shortcut, ...args) {
    super(args);
    this.name = "ShortcutException";
    this.shortcut = shortcut;
  }
}

/**
 * This class is used to managed the shortcuts within the app. This class
 * basically just listens for shortcuts and fires associated events with
 * the listener.
 */
class ShortcutManager {
  constructor() {
    log.info("[ShortcutManager] created -> okay");
    this.shortcuts = [];
    this.enabled = false;
    this.events = {
      shortcutsRecieved: EventFactory.createEvent(
        EventFactory.Types.SHORTCUTS_RECIEVED,
        this
      ),
    };
  }

  /**
   * static enum to store shortcut names. These are basically the type
   * of possible shortcuts that can be registered by the Manager.
   * @constructor
   */
  static get Names() {
    let prefix = "shortcut-";
    return {
      GLOBAL_SHOW_HIDE_CONSOLE:
        prefix + "global-show-hide-console",
      GLOBAL_SHOW_HIDE_CONSOLE_ALT:
        prefix + "global-show-hide-console-alt",
      GLOBAL_WINDOW_DEV_MODE:
        prefix + "global-window-dev-mode",
      WINDOW_SIDEBAR_FIRST_ITEM:
        prefix + "window-sidebar-first-item",
      WINDOW_SIDEBAR_SECOND_ITEM:
        prefix + "window-sidebar-second-item",
      WINDOW_SIDEBAR_THIRD_ITEM:
        prefix + "window-sidebar-third-item",
      WINDOW_SIDEBAR_FOURTH_ITEM:
        prefix + "window-sidebar-fourth-item",
      WINDOW_SIDEBAR_FIFTH_ITEM:
        prefix + "window-sidebar-fifth-item",
      WINDOW_SIDEBAR_WTF_ITEM:
        prefix + "window-sidebar-wtf-item",
      WINDOW_SIDEBAR_WTF_ITEM_ALT:
        prefix + "window-sidebar-wtf-item-alt",
    };
  }

  /**
   * an enum array of shortcut strings which are formated to electron specification
   * see => https://electronjs.org/docs/api/accelerator
   * @constructor
   */
  static get Accelerators() {
    return {
      CONSOLE_SHORTCUT: "Control+`",
      CONSOLE_SHORTCUT_ALT: "CommandOrControl+`",
      WINDOW_DEV_MODE: "CommandOrControl+Shift+I",
      WINDOW_SIDEBAR_FIRST_ITEM: "Control+1",
      WINDOW_SIDEBAR_SECOND_ITEM: "Control+2",
      WINDOW_SIDEBAR_THIRD_ITEM: "Control+3",
      WINDOW_SIDEBAR_FOURTH_ITEM: "Control+4",
      WINDOW_SIDEBAR_WTF_ITEM: "Control+Esc",
      WINDOW_SIDEBAR_WTF_ITEM_ALT: "Command+Esc",
    };
  }

  getConsoleShortcut() {
    let shortcut = this.findShortcutByName(ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE);

    let accelerator = shortcut.accelerator;
    let parts = accelerator.split('+');

    let modifier = parts[0];
    let key = parts[parts.length - 1];
    let hasShift = parts.length > 2;

    if (!hasShift) {
      key = key.toLowerCase();
    }

    return {
      name: shortcut.name,
      friendlyName: "Open Console",
      accelerator: shortcut.accelerator,
      modifier: modifier,
      key: key,
      hasShift: hasShift
    }
  }

  /**
   * Update accelerator key for the show/hide console shortcut
   * @param newAccelerator
   */
  updateConsoleShortcut(newAccelerator) {

    let shortcut = this.findShortcutByName(ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE);
    let altShortcut = this.findShortcutByName(ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE_ALT);

    globalShortcut.unregister(shortcut.accelerator);
    globalShortcut.unregister(altShortcut.accelerator);

    shortcut.accelerator = newAccelerator;
    altShortcut.accelerator = newAccelerator;

    this.configureGlobalShortcutCallback(shortcut);
    this.configureGlobalShortcutCallback(altShortcut);

    global.App.AppSettings.setConsoleShortcut(shortcut.accelerator);
    global.App.AppSettings.setConsoleShortcutAlt(altShortcut.accelerator);

  }

  findShortcutByName(shortcutName) {
    for (let shortcut of this.shortcuts) {
      if (shortcut.name === shortcutName) {
        return shortcut;
      }
    }
    return null;
  }

  /**
   * creates global app shortcuts which are listening even if the app has
   * no windows focused
   * @returns {{showHideConsole: Shortcut}}
   */
  initGlobalShortcuts() {
    log.info("[ShortcutManager] create global shortcuts");
    let shortcuts = {
      showHideConsole: new Shortcut(
        ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE,
        global.App.AppSettings.getConsoleShortcut(),
        this
      ),
      showHideConsoleAlt: new Shortcut(
        ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE_ALT,
        global.App.AppSettings.getConsoleShortcutAlt(),
        this
      ),
      consoleDevMode: new Shortcut(
        ShortcutManager.Names.GLOBAL_WINDOW_DEV_MODE,
        ShortcutManager.Accelerators.WINDOW_DEV_MODE,
        this
      ),
    };

    return shortcuts;
  }

  /**
   * registers the shortcut with the manager. Any shortcut with the window property
   * set is assumed to be only linked to that shortcut. currently we do not
   * check to see if a shortcut has already be set.. will override... abort abort.
   * @param shortcut
   * @returns {{window}|*}
   */
  registerShortcut(shortcut) {
    if (shortcut.isGlobal()) {
      log.info(
        "[ShortcutManager] register.global : " +
          shortcut.name +
          " { " +
          shortcut.accelerator +
          " }"
      );
    } else {
      log.info(
        "[ShortcutManager] register.window : " +
          shortcut.window.name +
          " { " +
          shortcut.name +
          " : " +
          shortcut.accelerator +
          " }"
      );
    }
    global.App.ShortcutManager.shortcuts.push(shortcut);
    this.configureGlobalShortcutCallback(shortcut);
  }

  configureGlobalShortcutCallback(shortcut) {
    globalShortcut.register(shortcut.accelerator, () => {
      if (global.App.ShortcutManager.enabled) {
        global.App.ShortcutManager.events.shortcutsRecieved.dispatch(
          shortcut.name
        );
        if (shortcut.callback) {
          shortcut.callback();
        }
      }
    });
  }

  /**
   * activates any shortcut associated with window parameter
   * @param window
   */
  activateWindowShortcuts(window) {
    let shortcut,
      shortcutCount =
        global.App.ShortcutManager.shortcuts.length;

    log.info(
      "[ShortcutManager] activate window shortcuts -> " +
        window.name +
        " {" +
        shortcutCount +
        "}"
    );
    for (let i = 0; i < shortcutCount; i++) {
      shortcut = global.App.ShortcutManager.shortcuts[i];
      if (
        shortcut.window &&
        shortcut.window.window === window
      ) {
        this.configureGlobalShortcutCallback(shortcut);
      }
    }
  }

  /**
   * deactivates any shortcut associated with window parameter
   * @param window
   */
  deactivateWindowShortcuts(window) {
    let shortcut,
      shortcutCount =
        global.App.ShortcutManager.shortcuts.length;

    log.info(
      "[ShortcutManager] deactivate window shortcuts -> " +
        window.name +
        " {" +
        shortcutCount +
        "}"
    );
    for (let i = 0; i < shortcutCount; i++) {
      shortcut = global.App.ShortcutManager.shortcuts[i];
      if (
        shortcut.window &&
        shortcut.window.window === window
      ) {
        globalShortcut.unregister(shortcut.accelerator);
      }
    }
  }
}

module.exports = {
  Shortcut,
  ShortcutError,
  ShortcutManager,
};
