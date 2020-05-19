const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  CircuitDatabase = require("../database/CircuitDatabase");

/**
 * This class is used to coordinate controllers across the team circuit service
 * @type {TeamCircuitController}
 */
module.exports = class TeamCircuitController extends BaseController {
  /**
   * builds our Team Circuit Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TeamCircuitController);
    if (!TeamCircuitController.instance) {
      TeamCircuitController.instance = this;
      TeamCircuitController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_MY_HOME_TEAM_CIRCUIT: string, LOAD_MY_HOME_TEAM_CIRCUIT: string, GET_ALL_MY_TEAM_CIRCUITS: string, LOAD_ALL_MY_TEAM_CIRCUITS: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_HOME_TEAM_CIRCUIT:
        "load-my-home-team-circuit",
      GET_MY_HOME_TEAM_CIRCUIT: "get-my-home-team-circuit",
      LOAD_ALL_MY_TEAM_CIRCUITS:
        "load-all-my-team-circuits",
      GET_ALL_MY_TEAM_CIRCUITS: "get-all-my-team-circuits"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      TeamCircuitController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      TeamCircuitController.instance
    );
    this.teamCircuitClientEventListener = EventFactory.createEvent(
      EventFactory.Types.TEAM_CIRCUIT_CLIENT,
      this,
      this.onTeamCircuitClientEvent,
      null
    );
  }

  /**
   * notified when we get a team circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTeamCircuitClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        TeamCircuitController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case TeamCircuitController.Events
          .LOAD_MY_HOME_TEAM_CIRCUIT:
          this.handleLoadMyHomeTeamCircuitEvent(event, arg);
          break;
        case TeamCircuitController.Events
          .GET_MY_HOME_TEAM_CIRCUIT:
          this.handleGetMyHomeTeamCircuitEvent(event, arg);
          break;
        case TeamCircuitController.Events
          .LOAD_ALL_MY_TEAM_CIRCUITS:
          this.handleLoadAllMyTeamCircuitsEvent(event, arg);
          break;
        case TeamCircuitController.Events
          .GET_ALL_MY_TEAM_CIRCUITS:
          this.handleGetAllMyTeamCircuitsEvent(event, arg);
          break;
        default:
          throw new Error(
            TeamCircuitController.Error.UNKNOWN +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * process team events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMyHomeTeamCircuitEvent(event, arg, callback) {
    let urn =
      TeamCircuitController.Paths.CIRCUIT +
      TeamCircuitController.Paths.TEAM +
      TeamCircuitController.Paths.HOME;

    this.doClientRequest(
      TeamCircuitController.Contexts.TEAM_CIRCUIT_CLIENT,
      {},
      TeamCircuitController.Names.GET_MY_HOME_TEAM_CIRCUIT,
      TeamCircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadMyHomeTeamCircuitCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our callback for our gridtime request of loading my home
   * team dto from the server.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMyHomeTeamCircuitCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let circuit = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.TEAM_CIRCUITS
        );

      if (circuit) {
        this.resetHomeTeamFlag(circuit, collection);
        let result = collection.findOne({ id: circuit.id });
        if (result) {
          collection.remove(result);
        }
        collection.insert(circuit);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * loads all of our team circuits we are participating in currently
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyTeamCircuitsEvent(event, arg, callback) {
    let urn =
      TeamCircuitController.Paths.CIRCUIT +
      TeamCircuitController.Paths.TEAM;

    this.doClientRequest(
      TeamCircuitController.Contexts.TEAM_CIRCUIT_CLIENT,
      {},
      TeamCircuitController.Names.GET_ALL_MY_TEAM_CIRCUITS,
      TeamCircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadAllMyTeamCircuitsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our gridtime request for loading all team circuits
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllMyTeamCircuitsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let circuits = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.TEAM_CIRCUITS
        );

      if (circuits && circuits.length > 0) {
        circuits.forEach(c => {
          let circuit = collection.findOne({
            teamId: c.teamId
          });
          if (circuit) {
            collection.remove(circuit);
          }
          collection.insert(c);
        });
      }

      console.log(collection);
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets one of our teams that is stored in the database, or fetch from
   * gridtime server.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyHomeTeamCircuitEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      collection = database.getCollection(
        CircuitDatabase.Collections.TEAM_CIRCUITS
      );

    arg.data = collection.findOne({ isHomeTeam: true });

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets all of our team circuits we are participating from our local database.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyTeamCircuitsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      view = database.getViewTeamCircuits();

    this.delegateCallbackWithView(null, view, event, arg);
  }
};
