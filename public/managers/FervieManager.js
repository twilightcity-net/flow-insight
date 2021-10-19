const FervieController = require("../controllers/FervieController"),
log = require("electron-log");

/**
 * managing class for the fervie client
 */
module.exports = class FervieManager {
  /**
   * builds the circuit manager for the global app scope
   */
  constructor() {
    this.name = "[FervieManager]";
    this.myController = new FervieController(this);
    this.myController.configureEvents();
  }

  init(callback) {
      //nothing to do for preloading
  }
};
