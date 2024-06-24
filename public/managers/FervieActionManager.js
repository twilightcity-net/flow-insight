const FervieActionController = require("../controllers/FervieActionController"),
  log = require("electron-log");

/**
 * managing class for the code client
 */
module.exports = class FervieActionManager {
  /**
   * builds the fervie action manager for the global app scope
   */
  constructor() {
    this.name = "[FervieActionManager]";
    this.myController = new FervieActionController(this);
    this.myController.configureEvents();
  }

  /**
   * Initializes our fervie action controller, nothing to do here
   * @param callback
   */
  init(callback) {
    if (callback) {
      callback();
    }
  }

};
