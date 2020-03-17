const TalkToController = require("../controllers/TalkToController");

/**
 * managing class for the talk to rest client for grid, these are async
 */
module.exports = class TalkToManager {
  /**
   * builds the talk to manager for the global app scope
   */
  constructor() {
    this.name = "[TalkToManager]";
    this.myController = new TalkToController(this);
    this.myController.configureEvents();
  }

  /**
   * function that is used to initialize the talk to manager
   * @param callback
   */
  init(callback) {
    this.handleInitCallback(callback);
  }

  /**
   * handles our callback in response from our controller event processing
   * @param callback
   */
  handleInitCallback(callback) {
    if (callback) {
      callback();
    }
  }
};
