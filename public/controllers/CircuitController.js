const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  CircuitDatabase = require("../database/CircuitDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {CircuitController}
 */
module.exports = class CircuitController extends BaseController {
  /**
   * builds our static Circuit controller which interfaces mainly with our local database
   * @param scope
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
      LOAD_CIRCUIT_WITH_ALL_DETAILS: "load-circuit-with-all-details",
      GET_ALL_MY_PARTICIPATING_CIRCUITS: "get-all-my-participating-circuits",
      GET_ALL_MY_DO_IT_LATER_CIRCUITS: "get-all-my-do-it-later-circuits"
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
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(CircuitController.Error.ERROR_ARGS, event, arg);
    } else {
      switch (arg.type) {
        case CircuitController.Events.START_WTF:
          this.handleStartWtfEvent(event, arg);
          break;
        case CircuitController.Events.START_WTF_WITH_CUSTOM_CIRCUIT_NAME:
          this.handleStartWtfWithCustomCircuitNameEvent(event, arg);
          break;
        case CircuitController.Events.LOAD_ALL_MY_PARTICIPATING_CIRCUITS:
          this.handleLoadAllMyParticipatingCircuitsEvent(event, arg);
          break;
        case CircuitController.Events.LOAD_ALL_MY_DO_IT_LATER_CIRCUITS:
          this.handleLoadAllMyDoItLaterCircuitsEvent(event, arg);
          break;
        case CircuitController.Events.LOAD_ACTIVE_CIRCUIT:
          this.handleLoadActiveCircuitEvent(event, arg);
          break;
        case CircuitController.Events.LOAD_CIRCUIT_WITH_ALL_DETAILS:
          this.handleLoadCircuitWithAllDetailsEvent(event, arg);
          break;
        case CircuitController.Events.GET_ALL_MY_PARTICIPATING_CIRCUITS:
          this.handleGetAllMyParticipatingCircuitsEvent(event, arg);
          break;
        case CircuitController.Events.GET_ALL_MY_DO_IT_LATER_CIRCUITS:
          this.handleGetAllMyDoItLaterCircuitsEvent(event, arg);
          break;
        default:
          throw new Error(
            CircuitController.Error.UNKNOWN_CIRCUIT_EVENT +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * helper function that called the start wtf with a custom name.
   * @param event
   * @param arg
   * @param callback
   */
  handleStartWtfEvent(event, arg, callback) {
    this.handleStartWtfWithCustomCircuitNameEvent(event, arg, callback);
  }

  /**
   * function handler that is used to create and start a new learning
   * circuit in grid time. This function will make a subvsequent call to
   * load its joined members if any have joined.
   * @param event
   * @param arg
   * @param callback
   */
  handleStartWtfWithCustomCircuitNameEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn = CircuitController.Paths.CIRCUIT_WTF;

    if (name) {
      urn += CircuitController.Paths.SEPARATOR + name;
    }

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.START_WTF_WITH_CUSTOM_CIRCUIT_NAME,
      CircuitController.Types.POST,
      urn,
      store =>
        this.delegateStartWtfWithCustomCircuitNameCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * process the callback for the start wtf with a custom name client event. Also
   * make sure we update this new active circuit in our current participating.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateStartWtfWithCustomCircuitNameCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
        collection = database.getCollection(CircuitDatabase.Collections.ACTIVE),
        view = database.getViewActiveCircuit(),
        circuit = store.data;

      this.batchRemoveFromViewInCollection(view, collection);
      collection = database.getCollection(
        CircuitDatabase.Collections.PARTICIPATING
      );
      this.updateSingleCircuitByIdInCollection(circuit, collection);
      if (circuit) {
        this.handleLoadCircuitWithAllDetailsEvent(
          null,
          { args: { circuitName: circuit.circuitName } },
          args => this.delegateCallbackWithView(args, view, event, arg)
        );
      }
    }
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

      this.updateCircuitsByIdInCollection(store.data, collection);
    }
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
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

      this.updateCircuitsByIdInCollection(store.data, collection);
    }
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
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
          args => this.delegateCallbackOrEventReplyTo(event, arg, callback)
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

      this.updateSingleCircuitByIdInCollection(store.data, collection);
    }
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  /**
   * gets all of our participating circuits that is stored in our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyParticipatingCircuitsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
      view = database.getViewAllMyParticipatingCircuits();

    this.logResults(this.name, arg.type, arg.id, view.count());
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  /**
   * performs a get query to find any circuit that is in our do it later collection
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyDoItLaterCircuitsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.CIRCUIT),
      view = database.getViewAllMyDoItLaterCircuits();

    this.logResults(this.name, arg.type, arg.id, view.count());
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(event, arg, callback);
  }

  /**
   * updates a single circuit by id from a given set a store data from gridtime
   * @param circuit
   * @param collection
   */
  updateSingleCircuitByIdInCollection(circuit, collection) {
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
  updateCircuitsByIdInCollection(circuits, collection) {
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
