const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  CircuitDatabase = require("../database/CircuitDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {CircuitController}
 */
module.exports = class CircuitController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, CircuitController);
    if (!CircuitController.instance) {
      CircuitController.instance = this;
      CircuitController.wireControllersTogether();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {String}
   * @constructor
   */
  static get EventTypes() {
    return {
      CREATE_CIRCUIT: "create-circuit",
      START_RETRO: "start-retro",
      JOIN_CIRCUIT: "join-circuit",
      LEAVE_CIRCUIT: "leave-circuit",
      CLOSE_CIRCUIT: "close-circuit",
      HOLD_CIRCUIT: "hold-circuit",
      RESUME_CIRCUIT: "resume-circuit",
      GET_CIRCUIT_MEMBERS: "get-circuit-members",
      GET_MY_CIRCUIT: "get-my-circuit",
      GET_MY_CIRCUIT_HOLDS: "get-my-circuit-holds",
      GET_MY_CIRCUITS_JOINED: "get-my-circuit-joined",
      GET_MEMBER_CIRCUIT_JOINED: "get-member-circuit-joined",
      LOAD_ALL_MY_PARTICIPATING_CIRCUITS: "load-all-my-participating-circuits",
      LOAD_ALL_MY_DO_IT_LATER_CIRCUITS: "load-all-my-do-it-later-circuits",
      LOAD_ACTIVE_CIRCUIT: "load-active-circuit",
      LOAD_CIRCUIT_WITH_ALL_DETAILS: "load-circuit-with-all-details"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(CircuitController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CircuitController.instance);
    this.circuitClientEventListener = EventFactory.createEvent(
      EventFactory.Types.CIRCUIT_CLIENT,
      this,
      this.onCircuitClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onCircuitClientEvent(event, arg) {
    log.info(chalk.yellowBright(this.name) + " event : " + JSON.stringify(arg));
    switch (arg.type) {
      case CircuitController.EventTypes.CREATE_CIRCUIT:
        this.handleCreateCircuitEvent(event, arg);
        break;
      case CircuitController.EventTypes.GET_MY_CIRCUIT:
        this.handleGetMyCircuitEvent(event, arg);
        break;
      case CircuitController.EventTypes.GET_MY_CIRCUITS_JOINED:
        this.handleGetMyCircuitsJoinedEvent(event, arg);
        break;
      case CircuitController.EventTypes.LOAD_ALL_MY_PARTICIPATING_CIRCUITS:
        this.handleLoadAllMyParticipatingCircuitsEvent(event, arg);
        break;
      case CircuitController.EventTypes.LOAD_ALL_MY_DO_IT_LATER_CIRCUITS:
        this.handleLoadAllMyDoItLaterCircuitsEvent(event, arg);
        break;
      case CircuitController.EventTypes.LOAD_ACTIVE_CIRCUIT:
        this.handleLoadActiveCircuitEvent(event, arg);
        break;
      case CircuitController.EventTypes.LOAD_CIRCUIT_WITH_ALL_DETAILS:
        this.handleLoadCircuitWithAllDetailsEvent(event, arg);
        break;
      default:
        throw new Error(
          CircuitController.Error.UNKNOWN_CIRCUIT_EVENT + " '" + arg.type + "'."
        );
    }
  }

  /**
   * processes the create circuit events for the listener. returns dto to callback
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateCircuitEvent(event, arg, callback) {
    let circuitName = arg.args.circuitName;
    this.doClientRequest(
      "CircuitClient",
      circuitName ? circuitName : {},
      "createLearningCircuit",
      "post",
      circuitName ? "/circuit/wtf/" + circuitName : "/circuit/wtf",
      store => {
        arg.dto = store.data;
        if (callback) {
          return callback(arg.dto);
        } else if (event) {
          return event.replyTo(arg);
        } else {
          throw new Error("Invalid create circuit event");
        }
      }
    );
  }

  handleGetMyCircuitEvent(event, arg, callback) {
    this.doClientRequest(
      "CircuitClient",
      {},
      "getActiveCircuit",
      "get",
      "/circuit/my/active",
      store => {
        arg.dto = store.data;
        if (callback) {
          return callback(arg.dto);
        } else if (event) {
          return event.replyTo(arg);
        } else {
          throw new Error("Invalid get active circuit event");
        }
      }
    );
  }

  handleGetMyCircuitsJoinedEvent(event, arg, callback) {
    this.doClientRequest(
      "CircuitClient",
      {},
      "getAllMyParticipatingCircuits",
      "get",
      "/circuit/my/participating",
      store => {
        arg.dto = store.data;
        if (callback) {
          return callback(arg.dto);
        } else if (event) {
          return event.replyTo(arg);
        } else {
          throw new Error(
            CircuitController.Error.INVALID_PARTICIPATING_CIRCUIT
          );
        }
      }
    );
  }

  /**
   * handles loading our participating circuits into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyParticipatingCircuitsEvent(event, arg, callback) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Strings.MY +
      CircuitController.Paths.PARTICIPATING;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ALL_MY_PARTICIPATING_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadAllMyParticipatingCircuitsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllMyParticipatingCircuitsCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
        collection = database.getCollection(
          CircuitDatabase.Collections.PARTICIPATING
        );

      this.updateCircuitsByIdFromStoreData(store.data, collection);
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * handles loading our participating circuits into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyDoItLaterCircuitsEvent(event, arg, callback) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Strings.MY +
      CircuitController.Paths.DO_IT_LATER;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ALL_MY_DO_IT_LATER_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadAllMyDoItLaterCircuitsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllMyDoItLaterCircuitsCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
        collection = database.getCollection(CircuitDatabase.Collections.LATER);

      this.updateCircuitsByIdFromStoreData(store.data, collection);
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * handles loading our participating circuits into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadActiveCircuitEvent(event, arg, callback) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Strings.MY +
      CircuitController.Paths.ACTIVE;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ACTIVE_CIRCUIT,
      CircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadActiveCircuitCallback(store, event, arg, callback)
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadActiveCircuitCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
        collection = database.getCollection(CircuitDatabase.Collections.ACTIVE),
        view = database.getViewActiveCircuit(),
        circuit = store.data;

      if (circuit) {
        this.handleLoadCircuitWithAllDetailsEvent(
          null,
          { args: { circuitName: circuit.circuitName } },
          args => this.doCallbackOrReplyTo(event, arg, callback)
        );
      }
    }
  }

  /**
   * handles loading our circuit with details into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadCircuitWithAllDetailsEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT + CircuitController.Paths.WTF + name;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_CIRCUIT_WITH_ALL_DETAILS,
      CircuitController.Types.GET,
      urn,
      store =>
        this.delegateLoadCircuitWithAllDetailsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param circuitName
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadCircuitWithAllDetailsCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
        collection = database.getCollection(CircuitDatabase.Collections.ACTIVE);

      this.updateSingleCircuitByIdFromStoreData(store.data, collection);
    }
    this.doCallbackOrReplyTo(event, arg, callback);
  }

  /**
   * updates a single circuit by id from a given set a store data from gridtime
   * @param circuit
   * @param collection
   */
  updateSingleCircuitByIdFromStoreData(circuit, collection) {
    if (circuit) {
      let model = collection.findOne({ id: circuit.id });
      if (model) {
        model = circuit;
        collection.update(model);
      } else {
        collection.insert(circuit);
      }
    }
  }

  /**
   * updates a list of learning circuits by id from a given set of gridtime store data
   * @param circuits
   * @param collection
   */
  updateCircuitsByIdFromStoreData(circuits, collection) {
    if (circuits && circuits.length > 0) {
      circuits.forEach(circuit => {
        let model = collection.findOne({ id: circuit.id });
        if (model) {
          model = circuit;
          collection.update(model);
        } else {
          collection.insert(circuit);
        }
      });
    }
  }
};
