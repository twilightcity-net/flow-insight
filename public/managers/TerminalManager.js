const TerminalController = require("../controllers/TerminalController"),
  log = require("electron-log");

/**
 * managing class for the terminal client
 */
module.exports = class TerminalManager {
  /**
   * builds the terminal manager for the global app scope
   */
  constructor() {
    this.name = "[TerminalManager]";
    this.myController = new TerminalController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }
};
