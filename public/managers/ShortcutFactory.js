const log = require("electron-log"),
  { ShortcutManager, Shortcut } = require("./ShortcutManager");

/* 
 * a factory class used to create new shortcuts
 */
module.exports = class ShortcutFactory {
  /*
   * creates and returns a new Shortcut Object
   */
  static createShortcut(name, ...args) {
    log.info("[ShortcutFactory] create shortcut -> " + name);
    let shortcut = new Shortcut(name, ...args);
    return shortcut;
  }

  /*
   * static enum to store shortcut names. These are basically the type
   * of possible shortcuts that can be registered by the Manager.
   */
  static get Names() {
    let prefix = "metaos-shortcut-";
    return {
      GLOBAL_TEST: prefix + "test-global",
      WINDOW_TEST: prefix + "test-window"
    };
  }
};
