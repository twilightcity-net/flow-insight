const DictionaryController = require("../controllers/DictionaryController");

/**
 * managing class for the dictionary client
 */
module.exports = class DictionaryManager {
  /**
   * builds the dictionary manager for the global app scope
   */
  constructor() {
    this.name = "[DictionaryManager]";
    this.myController = new DictionaryController(this);
    this.myController.configureEvents();
    this.loadCount = 0;
  }

  /**
   * initializes our Dictionary manager by loading all the initial dictionary terms into the database. This is
   * called by our volume manager
   * @param callback
   */
  init(callback) {
    this.loadCount = 0;
    DictionaryController.instance.handleLoadDictionaryEvent(
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
