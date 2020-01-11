import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererClientEvent } from "../events/RendererClientEvent";

export class CircuitClient extends BaseClient {
  constructor(scope) {
    super(scope, CircuitClient.constructor.name);
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {String}
   * @constructor
   */
  static get Events() {
    return {
      CREATE_CIRCUIT: "create-circuit",
      CREATE_NAMED_CIRCUIT: "create-named-circuit", //name
      START_RETRO: "start-retro", //name
      JOIN_CIRCUIT: "join-circuit", //name
      LEAVE_CIRCUIT: "leave-circuit", //name
      CLOSE_CIRCUIT: "close-circuit", //name
      HOLD_CIRCUIT: "hold-circuit", //name
      RESUME_CIRCUIT: "resume-circuit", //name
      GET_CIRCUIT_MEMBERS: "get-circuit-members", //name
      GET_MY_CIRCUIT: "get-my-circuit",
      GET_MY_CIRCUIT_HOLDS: "get-my-circuit-holds",
      GET_MY_CIRCUITS_JOINED: "get-my-circuit-joined",
      GET_MEMBER_CIRCUIT_JOINED: "get-member-circuit-joined" //memberId
    };
  }

  static init(scope) {
    if (!CircuitClient.instance) {
      CircuitClient.instance = new CircuitClient(scope);
    }

    /////////////////
    //// TESTING ////
    /////////////////

    CircuitClient.createLearningCircuit("angry_teachers", (event, arg) => {
      console.log(
        "[" + CircuitClient.name + "] learning circuit created : " + arg
      );
    });

    /////////////////////
    //// END TESTING ////
    /////////////////////
  }

  /**
   * creates a learning circuit dto
   * @param circuitName
   * @param callback
   */
  static createLearningCircuit(circuitName, callback) {
    console.log(
      "[" + CircuitClient.name + "] create learning circuit : " + circuitName
    );
    RendererEventFactory.createEvent(
      RendererEventFactory.Events.CIRCUIT_CLIENT,
      this,
      null,
      callback
    ).dispatch(
      new RendererClientEvent(CircuitClient.Events.CREATE_CIRCUIT, circuitName),
      true
    );
  }

  startRetroForWTF(circuitName, callback) {}

  joinExistingCircuit(circuitName, callback) {}

  leaveExistingCircuit(circuitName, callback) {}

  putCircuitOnHoldWithDoItLater(circuitName, callback) {}

  getCircuitWithMembers(circuitName, callback) {}

  getActiveCircuit(callback) {}

  getAllMyDoItLaterCircuits(callback) {}

  getAllMyParticipatingCircuits(callback) {}

  getAllParticipatingCircuitsForMember(memberId, callback) {}
}
