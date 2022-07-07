const FervieController = require("../controllers/FervieController"),
  log = require("electron-log");

/**
 * managing class for the fervie client
 */
module.exports = class FervieManager {
  /**
   * builds the fervie manager for the global app scope
   */
  constructor() {
    this.name = "[FervieManager]";
    this.myController = new FervieController(this);
    this.myController.configureEvents();
  }

  /**
   * Initializes our fervie buddies in the DB
   * @param callback
   */
  init(callback) {
    //nothing to do for preloading
    this.loadCount = 0;
    FervieController.instance.handleLoadBuddyListEvent(
      {},
      { args: {} },
      () => this.handleInitCallback(callback)
    );
  }


  /**
   * handles our callback in response from our controller event processing
   * @param callback
   */
  handleInitCallback(callback) {
    this.loadCount++;
    if (callback && this.loadCount === 1) {
      callback();
    }
  }
};
