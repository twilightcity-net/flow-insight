const log = require("electron-log");
const AccountController = require("../controllers/AccountController");

/**
 * managing class for the account client
 */
module.exports = class AccountManager {
  /**
   * builds the fervie manager for the global app scope
   */
  constructor() {
    this.name = "[AccountManager]";
    this.myController = new AccountController(this);
    this.myController.configureEvents();
  }

  /**
   * Initializes our fervie buddies in the DB
   * @param callback
   */
  init(callback) {
    //nothing to do for preloading
    this.handleInitCallback(callback);
  }


  /**
   * handles our callback in response from our controller event processing
   * @param callback
   */
  handleInitCallback(callback) {
    if (callback ) {
      callback();
    }
  }
};
