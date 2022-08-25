const CodeController = require("../controllers/CodeController"),
  log = require("electron-log");

/**
 * managing class for the code client
 */
module.exports = class CodeManager {
  /**
   * builds the code manager for the global app scope
   */
  constructor() {
    this.name = "[CodeManager]";
    this.myController = new CodeController(this);
    this.myController.configureEvents();
  }

  /**
   * Initializes our code controller, nothing to do here
   * @param callback
   */
  init(callback) {
    if (callback) {
      callback();
    }
  }

};
