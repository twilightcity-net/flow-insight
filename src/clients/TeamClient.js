import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";
import { RendererClientEvent } from "../events/RendererClientEvent";

/**
 * the client which is used to make team requests to gridtime. Basically we
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
      GET_MY_TEAM: "get-my-team"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!TeamClient.instance) {
      TeamClient.instance = new TeamClient(scope);
    }
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
    let clientEvent = new RendererClientEvent(
      TeamClient.Events.LOAD_MY_TEAM,
      {
        type: type,
        name: name
      },
      scope,
      (event, arg) => {
        if (callback) {
          callback(arg);
        }
      }
    );
    TeamClient.instance.notifyTeam(clientEvent);
    return clientEvent;
  }

  static getMyTeam(type, name, scope, callback) {
    let clientEvent = new RendererClientEvent(
      TeamClient.Events.GET_MY_TEAM,
      {
        type: type,
        name: name
      },
      scope,
      (event, arg) => {
        if (callback) {
          callback(arg);
        }
      }
    );
    TeamClient.instance.notifyTeam(clientEvent);
    return clientEvent;
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
    console.log(
      "[" +
        TeamClient.name +
        "] reply {" +
        TeamClient.replies.size +
        "} : " +
        arg.id +
        " -> " +
        arg.type
    );
    if (clientEvent) {
      TeamClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
      this.notifyListeners(clientEvent);
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
      "[" + TeamClient.name + "] notify -> " + JSON.stringify(clientEvent)
    );
    TeamClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }

  /**
   * notifies any additional listeners that we have received some new data from the
   * circuit controller
   * @param clientEvent
   */
  notifyListeners(clientEvent) {
    console.log(
      "[" +
        TeamClient.name +
        "] notify listeners {" +
        TeamClient.listeners.length +
        "}-> " +
        JSON.stringify(clientEvent)
    );
    for (var i = TeamClient.listeners.length - 1; i >= 0; i--) {
      let listener = TeamClient.listeners[i];
      console.log(listener);

      // TODO this needs execute the callback of this listener
    }
  }

  /**
   * registers a new listener that is associated to a given client event. These listeners
   * are wrapped as client events to maintain consistency.
   * @param clientEvent
   */
  registerListener(clientEvent) {
    console.log(
      "[" + TeamClient.name + "] register -> " + JSON.stringify(clientEvent)
    );
    TeamClient.listeners.push(clientEvent);
  }

  /**
   * removes the listener from our memory. this is important
   * @param clientEvent
   */
  unregisterListener(clientEvent) {
    console.log(
      "[" +
        TeamClient.name +
        "] unregister {" +
        TeamClient.listeners.length +
        "} -> " +
        JSON.stringify(clientEvent)
    );
    for (var i = TeamClient.listeners.length - 1; i >= 0; i--) {
      console.log(TeamClient.listeners[i]);
      if (clientEvent === TeamClient.listeners[i]) {
        TeamClient.listeners.splice(i, 1);
      }
    }
  }
}
