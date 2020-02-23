import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererClientEvent } from "../events/RendererClientEvent";
import { LearningCircuitModel } from "../models/LearningCircuitModel";

/**
 * the client which is used to make circuit requests to gridtime. Basically we
 * will use this class to fire an event which the main process listens for. On
 * notification it will make a rest call to grid time. the response is the
 * piped into the calling function to this client.
 *
 * EXAMPLE:
 *
 * `CircuitClient.createLearningCircuitModel("angry_teachers", this, model => {
 *     console.log(model);
 *   });`
 */
export class CircuitClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * our circuit event listeners that other classes use
   * @type {*}
   */
  static listeners = [];

  /**
   * our active circuit that we are in
   * @type {null}
   */
  static activeCircuit = null;

  /**
   * our list of active participating circuits we have joined
   * @type {LearningCircuitModel[]}
   */
  static activeCircuits = [];

  /**
   * builds the Client for a Circuit in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[CircuitClient]");
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
      CircuitClient.loadActiveCircuit();
      CircuitClient.loadAllMyParticipatingCircuits();
    }
  }

  /**
   * creates the learning circuit dto
   * @param circuitName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static createLearningCircuitModel(circuitName, scope, callback) {
    let clientEvent = new RendererClientEvent(
      CircuitClient.Events.CREATE_CIRCUIT,
      { circuitName: circuitName },
      scope,
      (event, arg) => {
        let model = new LearningCircuitModel(arg.dto);
        if (callback) {
          callback(model);
        }
      }
    );
    CircuitClient.instance.notifyCircuit(clientEvent);
    return clientEvent;
  }

  /**
   * loads our active circuit into the circuit client for the app to use
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadActiveCircuit(scope, callback) {
    let clientEvent = new RendererClientEvent(
      CircuitClient.Events.GET_MY_CIRCUIT,
      {},
      scope ? scope : CircuitClient.instance.scope,
      (event, arg) => {
        let model = new LearningCircuitModel(arg.dto);
        CircuitClient.activeCircuit = model;
        if (callback) {
          callback(model);
        }
      }
    );
    CircuitClient.instance.notifyCircuit(clientEvent);
    return clientEvent;
  }

  /**
   * gets all of our active circuits the team member has joined
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadAllMyParticipatingCircuits(scope, callback) {
    let clientEvent = new RendererClientEvent(
      CircuitClient.Events.GET_MY_CIRCUITS_JOINED,
      {},
      scope ? scope : CircuitClient.instance.scope,
      (event, arg) => {
        CircuitClient.activeCircuits = [];
        if (arg.dto) {
          for (let i = 0; i < arg.dto.length; i++) {
            CircuitClient.activeCircuits.push(
              new LearningCircuitModel(arg.dto[i])
            );
          }
        }
        if (callback) {
          callback(CircuitClient.activeCircuits);
        }
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
    this.notifyListeners(clientEvent);
  };

  /**
   * notifies the main process circuit that we have a new event to process. This
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

  /**
   * notifies any additional listeners that we have recieved some new data from the
   * circuit controller
   * @param clientEvent
   */
  notifyListeners(clientEvent) {
    console.log(
      "[" +
        CircuitClient.name +
        "] notify listeners {" +
        CircuitClient.listeners.length +
        "}-> " +
        JSON.stringify(clientEvent)
    );
    for (var i = CircuitClient.listeners.length - 1; i >= 0; i--) {
      let listener = CircuitClient.listeners[i];
      console.log(listener);

      // TODO this needs execute the callback of this listener
    }
  }

  /**
   * registers a new listener that is associated to a given client event. These listeners
   * are wrapped as client events to maintain consistency
   * @param clientEvent
   */
  registerListener(clientEvent) {
    console.log(
      "[" + CircuitClient.name + "] register -> " + JSON.stringify(clientEvent)
    );
    CircuitClient.listeners.push(clientEvent);
  }

  /**
   * removes the listener from our memory. this is important
   * @param clientEvent
   */
  unregisterListener(clientEvent) {
    console.log(
      "[" +
        CircuitClient.name +
        "] unregister {" +
        CircuitClient.listeners.length +
        "} -> " +
        JSON.stringify(clientEvent)
    );
    for (var i = CircuitClient.listeners.length - 1; i >= 0; i--) {
      console.log(CircuitClient.listeners[i]);
      if (clientEvent === CircuitClient.listeners[i]) {
        CircuitClient.listeners.splice(i, 1);
      }
    }
  }

  /////////////// NEED TO IMPLEMENT ///////////////

  startRetroForWTF(circuitName, callback) {}

  joinExistingCircuit(circuitName, callback) {}

  leaveExistingCircuit(circuitName, callback) {}

  putCircuitOnHoldWithDoItLater(circuitName, callback) {}

  getCircuitWithMembers(circuitName, callback) {}

  getAllMyDoItLaterCircuits(callback) {}

  getAllParticipatingCircuitsForMember(memberId, callback) {}

  abortExistingCircuit(circuitName) {}
}
