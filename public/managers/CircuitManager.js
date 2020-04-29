const CircuitController = require("../controllers/CircuitController");

/**
 * managing class for the circuit rest client for grid, these are async
 */
module.exports = class CircuitManager {
  /**
   * builds the circuit manager for the global app scope
   */
  constructor() {
    this.name = "[CircuitManager]";
    this.myController = new CircuitController(this);
    this.myController.configureEvents();
    this.loadCount = 0;
  }

  /**
   * function that is used to initialize the circuit manager
   * @param callback
   */
  init(callback) {
    CircuitController.instance.handleLoadAllMyParticipatingCircuitsEvent(
      null,
      {},
      () => this.handleInitCallback(callback)
    );
    CircuitController.instance.handleLoadAllMyDoItLaterCircuitsEvent(
      null,
      {},
      () => this.handleInitCallback(callback)
    );
    CircuitController.instance.handleLoadActiveCircuitEvent(
      null,
      {},
      () => this.handleInitCallback(callback)
    );
  }

  /**
   * handles our callback in response from our controller event processing
   * @param callback
   */
  handleInitCallback(callback) {
    this.loadCount++;
    if (callback && this.loadCount === 3) {
      callback();
    }
  }
};
