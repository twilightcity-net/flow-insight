const { globalShortcut } = require("electron"),
  log = require("electron-log"),
  // { AppError } = require("./AppErrors"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  EventManager = require("./EventManager");

/* 
 * an object class used to instantiate new shortcuts with events. These can
 * be global, a specific window, or within a local scope of a window (meaning
 * outside of this manager class -> quick and dirty)
 */
class ShortcutInput {
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
 * Base Exception class for any specific type of shortcut
 */
class ShortcutException extends Error {
  constructor(shortcut, ...args) {
    super(...args);
    this.class = "Error";
    this.name = "ShortcutException";
    this.shortcut = shortcut;
    this.msg = this.message;
    this.date = new Date();
  }

  /*
   * returns the error in string format
   */
  toString() {
    return (
      "[ " +
      this.name +
      " :: " +
      this.shortcut +
      " -> " +
      this.message +
      " @ " +
      Util.getDateTimeString(this.date) +
      " ]"
    );
  }
}

/*
 * Exception class to throw errors in Global Shortcuts
 */
class ShortcutGlobalException extends ShortcutException {
  constructor(shortcut, ...args) {
    super(shortcut, ...args);
    this.name = "GlobalShortcutException";
  }
}

/*
 * Exception class to throw errors in Window shortcuts
 */
class ShortcutWindowException extends ShortcutException {
  constructor(shortcut, ...args) {
    super(shortcut, ...args);
    this.name = "WindowShortcutException";
  }
}

/*
 * This class is used to managed the shortcuts within the app. This class
 * basically just listens for shortcuts and fires associated events with
 * the listener.
 */
class ShortcutManager {
  /*
   * Initialization method that creates an array to store shortcuts in
   */
  static init() {
    log.info("[ShortcutManager] Initialize");
    this.shortcuts = [];
    this.WindowManager = global.WindowManager;
    this.EventManager = global.EventManager;
    global.ShortcutManager = this;
    // throw new AppError("Heya fucker this is a test");
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
  ShortcutManager,
  ShortcutInput,
  ShortcutGlobalException,
  ShortcutWindowException
};
