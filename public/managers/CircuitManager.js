const CircuitController = require("../controllers/CircuitController");

/**
 * managing class for the circuit rest client for grid, these are async
 */
class CircuitManager {
  constructor() {
    this.name = "[CircuitManager]";
    this.myController = new CircuitController(this);
    this.myController.configureEvents();
  }

  createLearningCircuit(circuitName, callback) {
    return null;
  }

  startRetroForWTF(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/retro";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "startRetroForWTF",
      "post",
      uri,
      dto => {
        console.log(this.name + " start retro for wtf: " + circuitName);
        callback(dto);
      }
    );
  }

  joinExistingCircuit(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/join";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "joinExistingCircuit",
      "post",
      uri,
      dto => {
        console.log(this.name + " join existing circuit : " + circuitName);
        callback(dto);
      }
    );
  }

  leaveExistingCircuit(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/leave";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "leaveExistingCircuit",
      "post",
      uri,
      dto => {
        console.log(this.name + " leave existing circuit : " + circuitName);
        callback(dto);
      }
    );
  }

  closeExistingCircuit(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/close";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "closeExistingCircuit",
      "post",
      uri,
      dto => {
        console.log(this.name + " close existing circuit : " + circuitName);
        callback(dto);
      }
    );
  }

  putCircuitOnHoldWithDoItLater(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/hold";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "putCircuitOnHoldWithDoItLater",
      "post",
      uri,
      dto => {
        console.log(this.name + " put circuit on hold : " + circuitName);
        callback(dto);
      }
    );
  }

  resumeCircuit(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/resume";
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "resumeCircuit",
      "post",
      uri,
      dto => {
        console.log(this.name + " close existing circuit : " + circuitName);
        callback(dto);
      }
    );
  }

  getCircuitWithMembers(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName;
    CircuitController.doClientRequest(
      "CircuitClient",
      circuitName,
      "getCircuitWithMembers",
      "get",
      uri,
      dto => {
        console.log(this.name + " get circuit with members : " + circuitName);
        callback(dto);
      }
    );
  }

  getActiveCircuit(callback) {
    let uri = "/circuit/my/active";
    CircuitController.doClientRequest(
      "CircuitClient",
      {},
      "getActiveCircuit",
      "get",
      uri,
      dto => {
        console.log(this.name + " get my active circuit");
        callback(dto);
      }
    );
  }

  getAllMyDoItLaterCircuits(callback) {
    let uri = "/circuit/my/holds";
    CircuitController.doClientRequest(
      "CircuitClient",
      {},
      "getAllMyDoItLaterCircuits",
      "get",
      uri,
      dto => {
        console.log(this.name + " get do it later circuits" + dto);
        callback(dto);
      }
    );
  }

  getAllMyParticipatingCircuits(callback) {
    let uri = "/circuit/my/participating";
    CircuitController.doClientRequest(
      "CircuitClient",
      {},
      "getAllMyParticipatingCircuits",
      "get",
      uri,
      dto => {
        console.log(this.name + " get my participating circuits" + dto);
        callback(dto);
      }
    );
  }

  getAllParticipatingCircuitsForMember(memberId, callback) {
    let uri = "/circuit/member/" + memberId;
    CircuitController.doClientRequest(
      "CircuitClient",
      memberId,
      "getAllParticipatingCircuitsForMember",
      "get",
      uri,
      dto => {
        console.log(this.name + " get participating circuits for member" + dto);
        callback(dto);
      }
    );
  }
}

module.exports = CircuitManager;
