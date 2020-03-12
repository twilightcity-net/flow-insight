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
    this.callback = callback ? callback.bind(this.scope) : callback;
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
      )
    };
  }

  /**
   * static enum to store shortcut names. These are basically the type
   * of possible shortcuts that can be registered by the Manager.
   * @returns {{WINDOW_SIDEBAR_FIRST_ITEM: string, GLOBAL_SHOW_HIDE_CONSOLE: string, GLOBAL_WINDOW_DEV_MODE: string}}
   * @constructor
   */
  static get Names() {
    let prefix = "shortcut-";
    return {
      GLOBAL_SHOW_HIDE_CONSOLE: prefix + "global-show-hide-console",
      GLOBAL_SHOW_HIDE_CONSOLE_ALT: prefix + "global-show-hide-console-alt",
      GLOBAL_WINDOW_DEV_MODE: prefix + "global-window-dev-mode",
      WINDOW_SIDEBAR_FIRST_ITEM: prefix + "window-sidebar-first-item",
      WINDOW_SIDEBAR_SECOND_ITEM: prefix + "window-sidebar-second-item",
      WINDOW_SIDEBAR_THIRD_ITEM: prefix + "window-sidebar-third-item",
      WINDOW_SIDEBAR_FOURTH_ITEM: prefix + "window-sidebar-fourth-item",
      WINDOW_SIDEBAR_FIFTH_ITEM: prefix + "window-sidebar-fifth-item",
      WINDOW_SIDEBAR_WTF_ITEM: prefix + "window-sidebar-wtf-item",
      WINDOW_SIDEBAR_WTF_ITEM_ALT: prefix + "window-sidebar-wtf-item-alt"
    };
  }

  /**
   * an enum array of shortcut strings which are formated to electron specification
   * see => https://electronjs.org/docs/api/accelerator
   * @returns {{CONSOLE_SHORTCUT: string}}
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
      WINDOW_SIDEBAR_WTF_ITEM_ALT: "Command+Esc"
    };
  }

  /**
   * creates global app shortcuts which are listening even if the app has
   * no windows focused
   * @returns {{showHideConsole: Shortcut}}
   */
  createGlobalShortcuts() {
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
      )
    };
    return shortcuts;
  }

  /**
   * registers the shortcut with the manager. Any shortcut with the window property
   * set is assumed to be only linked to that shortcut. currently we do not
   * check to see if a shortcut has already be set.. will override
   * @param shortcut
   * @returns {{window}|*}
   */
  registerShortcut(shortcut) {
    if (shortcut.isGlobal()) {
      log.info(
        "[ShortcutManager] register global shortcut -> " +
          shortcut.name +
          " : '" +
          shortcut.accelerator +
          "'"
      );
    } else {
      log.info(
        "[ShortcutManager] register window shortcut -> " +
          shortcut.window.name +
          " : " +
          shortcut.name +
          " : " +
          shortcut.accelerator
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
   * @param win
   */
  activateWindowShortcuts(win) {
    let shortcut;
    for (var i = 0; i < global.App.ShortcutManager.shortcuts.length; i++) {
      shortcut = global.App.ShortcutManager.shortcuts[i];
      if (shortcut.window && shortcut.window.window === win) {
        log.info(
          "[ShortcutManager] register window shortcut -> " +
            shortcut.name +
            " : " +
            shortcut.accelerator
        );
        this.configureGlobalShortcutCallback(shortcut);
      }
    }
  }

  /**
   * deactivates any shortcut associated with window parameter
   * @param win
   */
  deactivateWindowShortcuts(win) {
    let shortcut;
    for (var i = 0; i < global.App.ShortcutManager.shortcuts.length; i++) {
      shortcut = global.App.ShortcutManager.shortcuts[i];
      if (shortcut.window && shortcut.window.window === win) {
        log.info(
          "[ShortcutManager] unregister window shortcut-> " +
            shortcut.name +
            " : " +
            shortcut.accelerator
        );
        globalShortcut.unregister(shortcut.accelerator);
      }
    }
  }
}

module.exports = {
  Shortcut,
  ShortcutError,
  ShortcutManager
};
