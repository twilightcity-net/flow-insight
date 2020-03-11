import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

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
  static _listeners = [];

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
   * @returns {{LOAD_ALL_MY_DO_IT_LATER_CIRCUITS: string, LOAD_ALL_MY_PARTICIPATING_CIRCUITS: string, LOAD_CIRCUIT_WITH_ALL_DETAILS: string, CREATE_CIRCUIT: string, LOAD_ACTIVE_CIRCUIT: string}}
   * @constructor
   */
  static get Events() {
    return {
      START_WTF: "start-wtf",
      START_WTF_WITH_CUSTOM_CIRCUIT_NAME: "startWTFWithCustomCircuitName",
      LOAD_ALL_MY_PARTICIPATING_CIRCUITS: "load-all-my-participating-circuits",
      LOAD_ALL_MY_DO_IT_LATER_CIRCUITS: "load-all-my-do-it-later-circuits",
      LOAD_ACTIVE_CIRCUIT: "load-active-circuit",
      LOAD_CIRCUIT_WITH_ALL_DETAILS: "load-circuit-with-all-details"
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
   * starts a new wtf session by creating a new learning circuit on gridtime
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static startWtf(scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.START_WTF,
      {},
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
  }

  /**
   * starts a new wtf session with a custom name by creating a bnew learning circuit in gridtime.
   * @param circuitName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static startWtfWithCustomCircuitName(circuitName, scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.START_WTF_WITH_CUSTOM_CIRCUIT_NAME,
      { circuitName: circuitName },
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
  }

  /**
   * loads all of our participating circuits we have joined into our local database
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadAllMyParticipatingCircuits(scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.LOAD_ALL_MY_PARTICIPATING_CIRCUITS,
      {},
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
  }

  /**
   * loads all of our do it later circuits into our local database
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadAllMyDoItLaterCircuits(scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.LOAD_ALL_MY_DO_IT_LATER_CIRCUITS,
      {},
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
  }

  /**
   * loads our active circuit into our local database with members. This
   * is accomplished by making two requests chained together. The first
   * request gets our active circuit information. The subsequent request get
   * our member information -- who is in the circuit.
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadActiveCircuit(scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.LOAD_ACTIVE_CIRCUIT,
      {},
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
  }

  /**
   * loads a team learning circuit by its circuit name with members into
   * our local database from grid time. This is usually called by our
   * load active circuit function.
   * @param circuitName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadCircuitWithAllDetails(circuitName, scope, callback) {
    let event = CircuitClient.instance.createClientEvent(
      CircuitClient.Events.LOAD_CIRCUIT_WITH_ALL_DETAILS,
      { circuitName: circuitName },
      scope,
      callback
    );
    CircuitClient.instance.notifyCircuit(event);
    return event;
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
    this.logReply(
      CircuitClient.name,
      CircuitClient.replies.size,
      arg.id,
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
        CircuitClient._listeners.length +
        "}-> " +
        JSON.stringify(clientEvent)
    );
    for (var i = CircuitClient._listeners.length - 1; i >= 0; i--) {
      let listener = CircuitClient._listeners[i];
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
    CircuitClient._listeners.push(clientEvent);
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
        CircuitClient._listeners.length +
        "} -> " +
        JSON.stringify(clientEvent)
    );
    for (var i = CircuitClient._listeners.length - 1; i >= 0; i--) {
      console.log(CircuitClient._listeners[i]);
      if (clientEvent === CircuitClient._listeners[i]) {
        CircuitClient._listeners.splice(i, 1);
      }
    }
  }
}
