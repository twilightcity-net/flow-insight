import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our team service
 */
export class TeamClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * Static name of the logged in house
   * @type {null}
   */
  static houseName = null;

  /**
   * builds the Client for a Team in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[TeamClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TEAM_CLIENT,
      this,
      null,
      this.onTeamEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_MY_HOME_TEAM: string, GET_ALL_MY_TEAMS: string, LOAD_MY_HOME_TEAM: string, LOAD_ALL_MY_TEAMS: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_HOME_TEAM: "load-my-home-team",
      LOAD_ALL_MY_TEAMS: "load-all-my-teams",
      GET_MY_HOME_TEAM: "get-my-home-team",
      GET_ALL_MY_TEAMS: "get-all-my-teams",
      GET_ACTIVE_HOUSE: "get-active-house"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TeamClient.instance) {
      TeamClient.instance = new TeamClient(scope);
      TeamClient.getActiveHouse(this, arg => {
        TeamClient.houseName = arg.data.houseName;
      });
    }
  }

  /**
   * loads our team from grid
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadMyHomeTeam(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.LOAD_MY_HOME_TEAM,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * loads all of the teams we are participating in from gridtime
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadAllMyTeams(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.LOAD_ALL_MY_TEAMS,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets our local team that we are in
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMyHomeTeam(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_MY_HOME_TEAM,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets the actively logged in house information
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getActiveHouse(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_ACTIVE_HOUSE,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets all of our teams that we are participating in
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getAllMyTeams(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_ALL_MY_TEAMS,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onTeamEventReply = (event, arg) => {
    let clientEvent = TeamClient.replies.get(arg.id);
    this.logReply(
      TeamClient.name,
      TeamClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      TeamClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyTeam(clientEvent) {
    console.log(
      "[" +
        TeamClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    TeamClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
