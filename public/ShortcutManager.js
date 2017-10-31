const { globalShortcut } = require("electron"),
  log = require("electron-log"),
  AppError = require("./AppError"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  EventManager = require("./EventManager");

/* 
 * an object class used to instantiate new shortcuts with events. These can
 * be global, a specific window, or within a local scope of a window (meaning
 * outside of this manager class -> quick and dirty)
 */
class Shortcut {
  /*
   * accelerator: the shortcut to register with
   * type: the type of shortcut; global, window, or local
   * event: the event to dispatch for shortcut
   */
  constructor(accelerator, type, event) {
    log.info(
      "[ShortcutManager] create shortcut : " + type + " -> " + accelerator
    );
    this.accelerator = accelerator;
    this.type = type;
    this.event = event;
  }
}

/*
 * Base Error class for any specific type of shortcut
 */
class ShortcutError extends AppError {
  constructor(shortcut, ...args) {
    super(...args);
    this.name = "ShortcutException";
    this.shortcut = shortcut;
  }
}

/*
 * This class is used to managed the shortcuts within the app. This class
 * basically just listens for shortcuts and fires associated events with
 * the listener.
 */
class ShortcutManager {
  constructor() {
    log.info("[ShortcutManager] created : okay");
    this.shortcuts = [];
  }

  static createGlobalShortcuts() {
    log.info("[ShortcutManager] create global shortcuts");

    // TODO implement shortcut register logic
  }

  /*
   * Static array containing all of our shortcuts the app uses
   */
  static get Shortcuts() {
    return this.shortcuts;
  }
}

module.exports = {
  Shortcut,
  ShortcutError,
  ShortcutManager
};
