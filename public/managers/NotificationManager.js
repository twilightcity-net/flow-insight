const NotificationController = require("../controllers/NotificationController");

/**
 * managing class for the notification client
 */
module.exports = class NotificationManager {
  /**
   * builds the fervie manager for the global app scope
   */
  constructor() {
    this.name = "[NotificationManager]";
    this.myController = new NotificationController(this);
    this.myController.configureEvents();
  }

  /**
   * Initializes any persistent notifications into the DB
   * @param callback
   */
  init(callback) {
    NotificationController.instance.handleLoadNotificationsEvent(
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
    if (callback) {
      callback();
    }
  }
};
