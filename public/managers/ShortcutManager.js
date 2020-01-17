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
  /**
   *
   * @param {name} the logical name of the shortcut
   * @param {accelerator} the shortcut to register with
   * @param {win} window to attach the shortcut; pass null to make global
   * @param {callback} the callback function to execute (optional)
   */
  constructor(name, accelerator, win, callback) {
    this.name = name;
    this.accelerator = accelerator;
    this.window = win;
    this.callback = callback;
    ShortcutManager.registerShortcut(this);
    globalShortcut.register(this.accelerator, () => {
      if (global.App.ShortcutManager.enabled) {
        EventManager.dispatch(EventFactory.Types.SHORTCUTS_RECIEVED, this);
        this.callback();
      }
    });
  }
}

/**
 * base error class for any specific type of shortcut
 */
class ShortcutError extends AppError {
  constructor(shortcut, ...args) {
    super(...args);
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
   * Static array containing all of our shortcuts the app uses
   * @returns {}
   * @constructor
   */
  static get Shortcuts() {
    return global.App.ShortcutManager.shortcuts;
  }

  /**
   * static enum to store shortcut names. These are basically the type
   * of possible shortcuts that can be registered by the Manager.
   * @returns {enum}
   * @constructor
   */
  static get Names() {
    let prefix = "torchie-shortcut-";
    return {
      GLOBAL_SHOW_HIDE_CONSOLE: prefix + "global-show-hide-console",
      TEST_WINDOW: prefix + "test-window"
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
      CONSOLE_SHORTCUT: "CommandOrControl+`",
      CONSOLE_SHORTCUT_ALT: "Control+`"
    };
  }

  /**
   * creates global app shortcuts which are listening even if the app has
   * no windows focused
   * @returns {{showHideConsole: Shortcut}}
   */
  static createGlobalShortcuts() {
    log.info("[ShortcutManager] create global shortcuts");

    let configuredHotkey = global.App.AppSettings.getConsoleShortcut(),
      configuredAltHotkey = global.App.AppSettings.getConsoleShortcutAlt();

    let shortcuts = {
      showHideConsole: new Shortcut(
        this.Names.GLOBAL_SHOW_HIDE_CONSOLE,
        configuredHotkey,
        null,
        () => {
          log.info(
            "[ShortcutManager] received shortcut keypress -> GLOBAL_SHOW_HIDE_CONSOLE"
          );
        }
      ),
      showHideConsoleAlt: new Shortcut(
        this.Names.GLOBAL_SHOW_HIDE_CONSOLE,
        configuredAltHotkey,
        null,
        () => {
          log.info(
            "[ShortcutManager] received shortcut.alt keypress-> GLOBAL_SHOW_HIDE_CONSOLE"
          );
        }
      )
    };

    log.info("[ShortcutManager] └> created global shortcuts -> okay");
    return shortcuts;
  }

  /**
   * registers the shortcut with the manager. Any shortcut with the window property
   * set is assumed to be only linked to that shortcut. currently we do not
   * check to see if a shortcut has already be set.. will override
   * @param shortcut
   * @returns {{window}|*}
   */
  static registerShortcut(shortcut) {
    if (!shortcut.window) {
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
    ShortcutManager.Shortcuts.push(shortcut);
    return shortcut;
  }

  /**
   * activates any shortcut associated with window parameter
   * @param win
   */
  static activateWindowShortcuts(win) {
    log.info("[ShortcutManager] activate window shortcuts -> " + win.name);
    let shortcut;
    for (var i = 0; i < ShortcutManager.Shortcuts.length; i++) {
      shortcut = ShortcutManager.Shortcuts[i];
      if (shortcut.window && shortcut.window.window === win) {
        log.info(
          "[ShortcutManager] found window shortcut to activate -> " +
            shortcut.name
        );
        globalShortcut.register(shortcut.accelerator, () =>
          shortcut.callback(win)
        );
      }
    }
  }

  /**
   * deactivates any shortcut associated with window parameter
   * @param win
   */
  static deactivateWindowShortcuts(win) {
    log.info("[ShortcutManager] deactivate window shortcuts -> " + win.name);
    let shortcut;
    for (var i = 0; i < ShortcutManager.Shortcuts.length; i++) {
      shortcut = ShortcutManager.Shortcuts[i];
      if (shortcut.window && shortcut.window.window === win) {
        log.info(
          "[ShortcutManager] found window shortcut to deactivate -> " +
            shortcut.name
        );
        globalShortcut.unregister(ShortcutManager.Shortcuts[i].accelerator);
      }
    }
  }
}

module.exports = {
  Shortcut,
  ShortcutError,
  ShortcutManager
};
