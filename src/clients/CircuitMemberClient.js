import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to converse with gridtime globally about circuit members
 */
export class CircuitMemberClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for global circuit member requests in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[CircuitMemberClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.CIRCUIT_MEMBER_CLIENT,
      this,
      null,
      this.onCircuitMemberEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @constructor
   */
  static get Events() {
    return {
      GET_CIRCUIT_MEMBERS: "get-circuit-members-global"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!CircuitMemberClient.instance) {
      CircuitMemberClient.instance = new CircuitMemberClient(scope);
    }
  }

  /**
   * Gets a list of circuit members in any circuit
   * @param circuitId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getCircuitMembers(
    circuitId,
    scope,
    callback
  ) {
    let event = CircuitMemberClient.instance.createClientEvent(
      CircuitMemberClient.Events.GET_CIRCUIT_MEMBERS,
      {
        circuitId: circuitId
      },
      scope,
      callback
    );

    CircuitMemberClient.instance.notifyCircuitMember(event);
    return event;
  }


  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onCircuitMemberEventReply = (event, arg) => {
    let clientEvent = CircuitMemberClient.replies.get(arg.id);
    this.logReply(
      CircuitMemberClient.name,
      CircuitMemberClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      CircuitMemberClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process circuit member that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyCircuitMember(clientEvent) {
    console.log(
      "[" +
        CircuitMemberClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    CircuitMemberClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
