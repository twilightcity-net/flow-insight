const CircuitController = require("../controllers/CircuitController");

/**
 * managing class for the circuit rest client for grid, these are async
 */
class CircuitClientManager {
  constructor() {
    this.name = "[CircuitClientManager]";
    this.myController = new CircuitController();
  }

  createLearningCircuit(circuitName, callback) {
    let uri = circuitName ? "/circuit/wtf/" + circuitName : "/circuit/wtf";
    this.myController.doClientRequest(
      "CircuitClient",
      circuitName ? circuitName : {},
      "createLearningCircuit",
      "post",
      uri,
      dto => {
        console.log(this.name + " create circuit for wtf: " + circuitName);
        callback(dto);
      }
    );
  }

  startRetroForWTF(circuitName, callback) {
    let uri = "/circuit/wtf/" + circuitName + "/retro";
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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
    this.myController.doClientRequest(
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

module.exports = CircuitClientManager;
