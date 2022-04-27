const NotificationController = require("../controllers/NotificationController"),
  log = require("electron-log");

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

  init(callback) {
    //nothing to do for preloading
  }
};
