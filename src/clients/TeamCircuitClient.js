import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our team circuit service. This service
 * runs parallel with our team client service. This circuit service is  responsible
 * for the inter-service communication via talk and gridtime for chatting.
 */
export class TeamCircuitClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * our team event listeners that other classes use
   * @type {*}
   */
  static listeners = [];

  /**
   * builds the Client for a Team Circuit in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[TeamCircuitClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TEAM_CIRCUIT_CLIENT,
      this,
      null,
      this.onTeamCircuitEventReply
    );
  }

  /**
   * general enum list of all of our possible team circuit events
   * @returns {{LOAD_MY_TEAM_CIRCUIT: string, GET_MY_TEAM_CIRCUIT: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_TEAM_CIRCUIT: "load-my-team-circuit",
      GET_MY_TEAM_CIRCUIT: "get-my-team-circuit"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TeamCircuitClient.instance) {
      TeamCircuitClient.instance = new TeamCircuitClient(
        scope
      );
    }
  }

  /**
   * loads our team circuits from grid
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadMyHomeTeam(scope, callback) {
    let event = TeamCircuitClient.instance.createClientEvent(
      TeamCircuitClient.Events.LOAD_MY_TEAM_CIRCUIT,
      {},
      scope,
      callback
    );
    TeamCircuitClient.instance.notifyTeamCircuit(event);
    return event;
  }

  /**
   * gets our local team circuit that we are in
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMyHomeTeam(scope, callback) {
    let event = TeamCircuitClient.instance.createClientEvent(
      TeamCircuitClient.Events.GET_MY_TEAM_CIRCUIT,
      {},
      scope,
      callback
    );
    TeamCircuitClient.instance.notifyTeamCircuit(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onTeamCircuitEventReply = (event, arg) => {
    let clientEvent = TeamCircuitClient.replies.get(arg.id);
    this.logReply(
      TeamCircuitClient.name,
      TeamCircuitClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      TeamCircuitClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyTeamCircuit(clientEvent) {
    console.log(
      "[" +
        TeamCircuitClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    TeamCircuitClient.replies.set(
      clientEvent.id,
      clientEvent
    );
    this.event.dispatch(clientEvent, true);
  }
}
