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
   * our team event listeners that other classes use
   * @type {*}
   */
  static listeners = [];

  /**
   * stores my current status for other gui things to use
   * @type {MemberWorkStatusDto}
   */
  static me = null;

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
   * @returns {String}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_TEAM: "load-my-team",
      LOAD_MY_CURRENT_STATUS: "load-my-current-status",
      LOAD_STATUS_OF_ME_AND_MY_TEAM:
        "load-status-of-me-and-my-team",
      GET_MY_TEAM: "get-my-team",
      GET_MY_CURRENT_STATUS: "get-my-current-status",
      GET_STATUS_OF_ME_AND_MY_TEAM:
        "get-status-of-me-and-my-team"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TeamClient.instance) {
      TeamClient.instance = new TeamClient(scope);
      TeamClient.getMyCurrentStatus(this, arg => {
        TeamClient.me = arg.data[0];
      });
    }
  }

  /**
   * gets our status object of ourself
   * @returns {MemberWorkStatusDto}
   */
  static getMe() {
    return TeamClient.me;
  }

  /**
   * loads our team from grid
   * @param type
   * @param name
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadMyTeam(type, name, scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.LOAD_MY_TEAM,
      {
        type: type,
        name: name
      },
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * loads my current status into our database from grid
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadMyCurrentStatus(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.LOAD_MY_CURRENT_STATUS,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * loads the status of me and my team into our local database
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadStatusOfMeAndMyTeam(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.LOAD_STATUS_OF_ME_AND_MY_TEAM,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets our local team that we are in
   * @param type
   * @param name
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMyTeam(type, name, scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_MY_TEAM,
      {
        type: type,
        name: name
      },
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets my current status from our Team client service
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMyCurrentStatus(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_MY_CURRENT_STATUS,
      {},
      scope,
      callback
    );
    TeamClient.instance.notifyTeam(event);
    return event;
  }

  /**
   * gets the status of me and my team from our TeamClient service
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getStatusOfMeAndMyTeam(scope, callback) {
    let event = TeamClient.instance.createClientEvent(
      TeamClient.Events.GET_STATUS_OF_ME_AND_MY_TEAM,
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
