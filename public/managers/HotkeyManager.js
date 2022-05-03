const HotkeyController = require("../controllers/HotkeyController");

/**
 * managing class for the hotkey client
 */
module.exports = class HotkeyManager {
  /**
   * builds the hotkey manager for the global app scope
   */
  constructor() {
    this.name = "[HotkeyManager]";
    this.myController = new HotkeyController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }
};
