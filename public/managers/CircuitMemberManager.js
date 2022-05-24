const CircuitMemberController = require("../controllers/CircuitMemberController");

/**
 * managing class for the circuit member client
 */
module.exports = class CircuitMemberManager {
  /**
   * builds the circuit member manager for the global app scope
   */
  constructor() {
    this.name = "[CircuitMemberManager]";
    this.myController = new CircuitMemberController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }
};
