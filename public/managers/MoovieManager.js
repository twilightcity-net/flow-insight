const MoovieController = require("../controllers/MoovieController");

/**
 * managing class for the moovie client
 */
module.exports = class MoovieManager {
  /**
   * builds the moovie manager for the global app scope
   */
  constructor() {
    this.name = "[MoovieManager]";
    this.myController = new MoovieController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }
};
