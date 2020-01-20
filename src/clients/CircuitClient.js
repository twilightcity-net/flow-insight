import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererClientEvent } from "../events/RendererClientEvent";
import { LearningCircuitModel } from "../models/LearningCircuitModel";

/**
 * the client which is used to make circuit requests to gridtime. Basically we
 * will use this class to fire an event which the main process listens for. On
 * notification it will make a rest call to grid time. the response is the
 * piped into the calling function to this client.
 */
export class CircuitClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for a Circuit in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, CircuitClient.constructor.name);
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.CIRCUIT_CLIENT,
      this,
      null,
      this.onCircuitEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {String}
   * @constructor
   */
  static get Events() {
    return {
      CREATE_CIRCUIT: "create-circuit",
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

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!CircuitClient.instance) {
      CircuitClient.instance = new CircuitClient(scope);
    }
  }

  /**
   * creates a learning circuit dto
   * @param circuitName
   * @param callback
   */
  static createLearningCircuitModel(circuitName, scope, callback) {
    let clientEvent = new RendererClientEvent(
      CircuitClient.Events.CREATE_CIRCUIT,
      { circuitName: circuitName },
      scope,
      (event, arg) => {
        let model = new LearningCircuitModel(arg.dto, scope);
        callback(model);
      }
    );
    CircuitClient.instance.notifyCircuit(clientEvent);
    return clientEvent;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onCircuitEventReply = (event, arg) => {
    let clientEvent = CircuitClient.replies.get(arg.id);
    console.log(
      "[" +
        CircuitClient.name +
        "] reply {" +
        CircuitClient.replies.size +
        "} : " +
        arg.id +
        " -> " +
        arg.type
    );
    if (clientEvent) {
      CircuitClient.replies.delete(arg.id);
    }
    clientEvent.callback(event, arg);
  };

  /**
   * notifies the main process circuit that we4 have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyCircuit(clientEvent) {
    console.log(
      "[" + CircuitClient.name + "] notify -> " + JSON.stringify(clientEvent)
    );
    CircuitClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
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
