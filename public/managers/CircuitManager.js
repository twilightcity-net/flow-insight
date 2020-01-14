const CircuitController = require("../controllers/CircuitController");

/**
 * managing class for the circuit rest client for grid, these are async
 */
class CircuitManager {
  /**
   * builds the circuit manager for the global app scope
   */
  constructor() {
    this.name = "[CircuitManager]";
    this.myController = new CircuitController(this);
    this.myController.configureEvents();
  }

  /**
   * creates the learning circuit via remote call to gridtime
   * @param circuitName
   * @param callback
   */
  createLearningCircuit(circuitName, callback) {
    CircuitController.instance.handleCreateCircuitEvent(
      {},
      { args: { circuitName: circuitName } },
      callback
    );
  }

  startRetroForWTF(circuitName, callback) {
    return null;
  }

  joinExistingCircuit(circuitName, callback) {
    return null;
  }

  leaveExistingCircuit(circuitName, callback) {
    return null;
  }

  closeExistingCircuit(circuitName, callback) {
    return null;
  }

  putCircuitOnHoldWithDoItLater(circuitName, callback) {
    return null;
  }

  resumeCircuit(circuitName, callback) {
    return null;
  }

  getCircuitWithMembers(circuitName, callback) {
    return null;
  }

  getActiveCircuit(callback) {
    return null;
  }

  getAllMyDoItLaterCircuits(callback) {
    return null;
  }

  getAllMyParticipatingCircuits(callback) {
    return null;
  }

  getAllParticipatingCircuitsForMember(memberId, callback) {
    return null;
  }
}

module.exports = CircuitManager;
