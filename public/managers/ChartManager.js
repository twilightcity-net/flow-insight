const ChartController = require("../controllers/ChartController"),
  log = require("electron-log");

/**
 * managing class for the chart client
 */
module.exports = class ChartManager {
  /**
   * builds the circuit manager for the global app scope
   */
  constructor() {
    this.name = "[ChartManager]";
    this.myController = new ChartController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }
};
