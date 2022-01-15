const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  CircuitDatabase = require("../database/CircuitDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  Util = require("../Util");

/**
 * This class is used to coordinate controllers across the talknet service
 * @type {CircuitController}
 */
module.exports = class CircuitController extends (
  BaseController
) {
  /**
   * builds our static Circuit controller which interfaces mainly with our local database
   * @param scope
   * @constructor
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
   * @returns {{LOAD_CIRCUIT_MEMBERS: string, LOAD_ALL_MY_DO_IT_LATER_CIRCUITS: string, LOAD_ALL_MY_PARTICIPATING_CIRCUITS: string, PAUSE_WTF_WITH_DO_IT_LATER: string, SOLVE_WTF: string, GET_ALL_MY_RETRO_CIRCUITS: string, GET_CIRCUIT_MEMBERS: string, CANCEL_WTF: string, START_WTF: string, GET_CIRCUIT_WITH_ALL_DETAILS: string, LOAD_ACTIVE_CIRCUIT: string, LEAVE_WTF: string, GET_ACTIVE_CIRCUIT: string, START_WTF_WITH_CUSTOM_CIRCUIT_NAME: string, GET_ALL_MY_PARTICIPATING_CIRCUITS: string, LOAD_CIRCUIT_WITH_ALL_DETAILS: string, JOIN_WTF: string, GET_ALL_MY_DO_IT_LATER_CIRCUITS: string, START_RETRO_FOR_WTF: string, RESUME_WTF: string}}
   * @constructor
   */
  static get Events() {
    return {
      START_WTF: "start-wtf",
      JOIN_WTF: "join-wtf",
      LEAVE_WTF: "leave-wtf",
      START_WTF_WITH_CUSTOM_CIRCUIT_NAME:
        "start-wtf-with-custom-circuit-name",
      LOAD_ALL_MY_PARTICIPATING_CIRCUITS:
        "load-all-my-participating-circuits",
      LOAD_ALL_MY_DO_IT_LATER_CIRCUITS:
        "load-all-my-do-it-later-circuits",
      LOAD_ALL_MY_RETRO_CIRCUITS:
        "load-all-my-retro-circuits",
      LOAD_ALL_MY_SOLVED_CIRCUITS:
        "load-all-my-solved-circuits",
      LOAD_ACTIVE_CIRCUIT: "load-active-circuit",
      LOAD_CIRCUIT_WITH_ALL_DETAILS:
        "load-circuit-with-all-details",
      LOAD_CIRCUIT_MEMBERS: "load-circuit-members",
      GET_ALL_MY_PARTICIPATING_CIRCUITS:
        "get-all-my-participating-circuits",
      GET_ALL_MY_DO_IT_LATER_CIRCUITS:
        "get-all-my-do-it-later-circuits",
      GET_ALL_MY_RETRO_CIRCUITS:
        "get-all-my-retro-circuits",
      GET_ACTIVE_CIRCUIT: "get-active-circuit",
      GET_CIRCUIT_WITH_ALL_DETAILS:
        "get-circuit-with-all-details",
      GET_CIRCUIT_MEMBERS: "get-circuit-members",
      SOLVE_WTF: "solve-wtf",
      CANCEL_WTF: "cancel-wtf",
      CLOSE_WTF: "close-wtf",
      PAUSE_WTF_WITH_DO_IT_LATER:
        "pause-wtf-with-do-it-later",
      RESUME_WTF: "resume-wtf",
      START_RETRO_FOR_WTF: "start-retro-for-wtf",
      UPDATE_CIRCUIT_DESCRIPTION:
        "update-circuit-description",
      SAVE_CIRCUIT_TAGS: "save-circuit-tags",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(
      CircuitController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CircuitController.instance);
    this.circuitClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.CIRCUIT_CLIENT,
        this,
        this.onCircuitClientEvent,
        null
      );
  }

  /**
   * Force resets the circuit details database, so if our connection disconnects,
   * we won't be returning stale data
   */
  reset() {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      collection = database.getCollection(
        CircuitDatabase.Collections.CIRCUITS
      );

    collection.chain().remove();
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
      this.handleError(
        CircuitController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case CircuitController.Events.START_WTF:
          this.handleStartWtfEvent(event, arg);
          break;
        case CircuitController.Events
          .START_WTF_WITH_CUSTOM_CIRCUIT_NAME:
          this.handleStartWtfWithCustomCircuitNameEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events.JOIN_WTF:
          this.handleJoinWtfEvent(event, arg);
          break;
        case CircuitController.Events.LEAVE_WTF:
          this.handleLeaveWtfEvent(event, arg);
          break;
        case CircuitController.Events
          .LOAD_ALL_MY_PARTICIPATING_CIRCUITS:
          this.handleLoadAllMyParticipatingCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events
          .LOAD_ALL_MY_DO_IT_LATER_CIRCUITS:
          this.handleLoadAllMyDoItLaterCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events
          .LOAD_ALL_MY_RETRO_CIRCUITS:
          this.handleLoadAllTeamRetroCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events
          .LOAD_ALL_MY_SOLVED_CIRCUITS:
          this.handleLoadAllTeamSolvedCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events.LOAD_ACTIVE_CIRCUIT:
          this.handleLoadActiveCircuitEvent(event, arg);
          break;
        case CircuitController.Events
          .LOAD_CIRCUIT_WITH_ALL_DETAILS:
          this.handleLoadCircuitWithAllDetailsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events.LOAD_CIRCUIT_MEMBERS:
          this.handleLoadCircuitMembersEvent(event, arg);
          break;
        case CircuitController.Events
          .GET_ALL_MY_PARTICIPATING_CIRCUITS:
          this.handleGetAllMyParticipatingCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events
          .GET_ALL_MY_DO_IT_LATER_CIRCUITS:
          this.handleGetAllMyDoItLaterCircuitsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events
          .GET_ALL_MY_RETRO_CIRCUITS:
          this.handleGetAllMyRetroCircuitsEvent(event, arg);
          break;
        case CircuitController.Events.GET_ACTIVE_CIRCUIT:
          this.handleGetActiveCircuitEvent(event, arg);
          break;
        case CircuitController.Events
          .GET_CIRCUIT_WITH_ALL_DETAILS:
          this.handleGetCircuitWithAllDetailsEvent(
            event,
            arg
          );
          break;
        case CircuitController.Events.GET_CIRCUIT_MEMBERS:
          this.handleGetCircuitMembersEvent(event, arg);
          break;
        case CircuitController.Events.SOLVE_WTF:
          this.handleSolveWtfEvent(event, arg);
          break;
        case CircuitController.Events.CANCEL_WTF:
          this.handleCancelWtfEvent(event, arg);
          break;
        case CircuitController.Events.CLOSE_WTF:
          this.handleCloseWtfEvent(event, arg);
          break;
        case CircuitController.Events
          .PAUSE_WTF_WITH_DO_IT_LATER:
          this.handlePauseWTFWithDoItLaterEvent(event, arg);
          break;
        case CircuitController.Events.RESUME_WTF:
          this.handleResumeWtfEvent(event, arg);
          break;
        case CircuitController.Events.START_RETRO_FOR_WTF:
          this.handleStartRetroForWTFEvent(event, arg);
          break;
        case CircuitController.Events
          .UPDATE_CIRCUIT_DESCRIPTION:
          this.handleUpdateCircuitDescription(event, arg);
          break;
        case CircuitController.Events.SAVE_CIRCUIT_TAGS:
          this.handleSaveTags(event, arg);
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
    this.handleStartWtfWithCustomCircuitNameEvent(
      event,
      arg,
      callback
    );
  }

  /**
   * function handler that is used to create and start a new learning
   * circuit in grid time. This function will make a subvsequent call to
   * load its joined members if any have joined.
   * @param event
   * @param arg
   * @param callback
   */
  handleStartWtfWithCustomCircuitNameEvent(
    event,
    arg,
    callback
  ) {
    let name = arg.args.circuitName,
      urn = CircuitController.Paths.CIRCUIT_WTF;

    if (name) {
      urn += CircuitController.Paths.SEPARATOR + name;
    }

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names
        .START_WTF_WITH_CUSTOM_CIRCUIT_NAME,
      CircuitController.Types.POST,
      urn,
      (store) =>
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
  delegateStartWtfWithCustomCircuitNameCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * joins a given circuit name as a participant. This updates the status on
   * gridtime which will send talk messages to update the local database.
   * @param event
   * @param arg
   * @param callback
   */
  handleJoinWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.JOIN;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.JOIN_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateJoinWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles the callback for when we join wtf circuit.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateJoinWtfCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles the leave circuit event for a member see joinWtf for more
   * information about this subject.
   * @param event
   * @param arg
   * @param callback
   */
  handleLeaveWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.LEAVE;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.LEAVE_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateLeaveWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles the callback for when we leave wtf circuit.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLeaveWtfCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our participating circuits into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyParticipatingCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Paths.SEPARATOR +
      CircuitController.Strings.MY +
      CircuitController.Paths.PARTICIPATING;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names
        .GET_ALL_MY_PARTICIPATING_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      (store) =>
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
  delegateLoadAllMyParticipatingCircuitsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.PARTICIPATING
        );

      this.updateCircuitsByIdInCollection(
        store.data,
        collection
      );
    }

    //this doesn't return the store data, into arg.data, but it does put the items in the DB.
    //participating would be, any wtf that I've participated in... that isn't closed.

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our do it later circuits into our local database.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyDoItLaterCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Paths.SEPARATOR +
      CircuitController.Strings.MY +
      CircuitController.Paths.DO_IT_LATER;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names
        .GET_ALL_MY_DO_IT_LATER_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      (store) =>
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
  delegateLoadAllMyDoItLaterCircuitsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.LATER
        );

      this.updateCircuitsByIdInCollection(
        store.data,
        collection
      );
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our retro circuits into our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllTeamSolvedCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Paths.TEAM +
      CircuitController.Paths.SOLVE;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ALL_MY_SOLVED_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadAllMySolvedCircuitsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles loading our retro circuits into our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllTeamRetroCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let urn =
      CircuitController.Paths.CIRCUIT +
      CircuitController.Paths.TEAM +
      CircuitController.Paths.RETRO;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ALL_MY_RETRO_CIRCUITS,
      CircuitController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadAllMyRetroCircuitsCallback(
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
  delegateLoadAllMyRetroCircuitsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.RETRO
        );

      this.updateCircuitsByIdInCollection(
        store.data,
        collection
      );
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllMySolvedCircuitsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.SOLVED
        );

      this.updateCircuitsByIdInCollection(
        store.data,
        collection
      );
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our participating circuits into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadActiveCircuitEvent(event, arg, callback) {
    let urn = CircuitController.Paths.CIRCUIT_WTF;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_ACTIVE_CIRCUIT,
      CircuitController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadActiveCircuitCallback(
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
  delegateLoadActiveCircuitCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      this.logMessage(
        "[CircuitController]",
        "load active circuit error: " + store.error
      );
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.ACTIVE
        ),
        view = database.getViewActiveCircuit(),
        circuit = store.data;

      this.batchRemoveFromViewInCollection(
        view,
        collection
      );
      if (circuit && !Util.isEmpty(circuit)) {
        this.updateSingleCircuitByIdInCollection(
          circuit,
          collection
        );
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our circuit with details into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadCircuitWithAllDetailsEvent(
    event,
    arg,
    callback
  ) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT +
        CircuitController.Paths.SEPARATOR +
        CircuitController.Paths.WTF +
        name;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_CIRCUIT_WITH_ALL_DETAILS,
      CircuitController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadCircuitWithAllDetailsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadCircuitWithAllDetailsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.CIRCUITS
        ),
        circuit = store.data;

      if (circuit) {
        this.updateSingleCircuitByIdInCollection(
          circuit,
          collection
        );
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles loading our circuit memberss into our local databse
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadCircuitMembersEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT +
        CircuitController.Paths.SEPARATOR +
        CircuitController.Paths.WTF +
        name +
        CircuitController.Paths.MEMBER;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.GET_CIRCUIT_MEMBERS,
      CircuitController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadCircuitMembersCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadCircuitMembersCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let circuitMembers = store.data;
      if (circuitMembers) {
        let uri = arg.args.uri,
          database = DatabaseFactory.getDatabase(
            DatabaseFactory.Names.CIRCUIT
          ),
          collection =
            database.getCollectionForCircuitMembers(uri),
          view =
            database.getViewCircuitMembersForCollection(
              collection
            );
        database.updateCircuitMembersInCollection(
          uri,
          circuitMembers,
          collection
        );

        arg.data = view.data();
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets all of our participating circuits that is stored in our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyParticipatingCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      view = database.getViewAllMyParticipatingCircuits();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      view.count()
    );
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * performs a get query to find any circuit that is in our do it later collection
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyDoItLaterCircuitsEvent(
    event,
    arg,
    callback
  ) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      view = database.getViewAllMyDoItLaterCircuits();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      view.count()
    );
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * performs a get query to find any circuit that is in our do it later collection
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyRetroCircuitsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      rview = database.getViewAllMyRetroCircuits(),
      sview = database.getViewAllMySolvedCircuits();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      sview.count() + rview.count()
    );
    arg.data = rview.data();

    arg.data = arg.data.concat(sview.data());

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets our active circuit from our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetActiveCircuitEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      view = database.getViewActiveCircuit();

    this.logResults(
      this.name,
      arg.type,
      arg.id,
      view.count()
    );
    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets our circuit with details from the database. will load a new one from
   * grid time if it does not find it..
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCircuitWithAllDetailsEvent(
    event,
    arg,
    callback
  ) {
    let circuitName = arg.args.circuitName,
      database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      collection = database.getCollection(
        CircuitDatabase.Collections.CIRCUITS
      ),
      view = database.getViewCircuits(),
      circuit = collection.findOne({
        circuitName: circuitName,
      });

    if (circuit) {
      this.logResults(
        this.name,
        arg.type,
        arg.id,
        view.count()
      );
      arg.data = circuit;
      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      this.handleLoadCircuitWithAllDetailsEvent(
        null,
        { args: { circuitName: circuitName } },
        (args) => {
          circuit = collection.findOne({
            circuitName: circuitName,
          });
          arg.data = circuit;
          this.delegateCallbackOrEventReplyTo(
            event,
            arg,
            callback
          );
        }
      );
    }
  }

  /**
   * gets our circuit members by call load circuit members in this class if
   * the collection for that room does not exist or is empty. Might need to
   * call load if this is empty.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCircuitMembersEvent(event, arg, callback) {
    let uri = arg.args.uri,
      database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      collection =
        database.getCollectionForCircuitMembers(uri),
      view =
        database.getViewCircuitMembersForCollection(
          collection
        );

    arg.data = view.data();
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles our solve wtf event generated by the user. this starts the retro
   * process.
   * @param event
   * @param arg
   * @param callback
   */
  handleSolveWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.SOLVE;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.SOLVE_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateSolveWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our solve wtf request
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateSolveWtfCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles our cancel wtf event generated by the user. This function has a
   * delegator function that handles its callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleCancelWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.CANCEL;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.CANCEL_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateCancelWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our close wtf event generated by the user. This function has a
   * delegator function that handles its callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleCloseWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.MARK +
        CircuitController.Paths.CLOSE;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.CLOSE_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateCloseWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our event callback for when we cancle a wtf. This will remove the circuit
   * from our active, participating, and circuits collections. just
   * forget about it.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateCancelWtfCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        collection = database.getCollection(
          CircuitDatabase.Collections.ACTIVE
        ),
        view = database.getViewActiveCircuit(),
        circuit = store.data;

      this.batchRemoveFromViewInCollection(
        view,
        collection
      );

      if (circuit) {
        collection = database.getCollection(
          CircuitDatabase.Collections.PARTICIPATING
        );
        this.removeSingleCircuitByIdFromCollection(
          circuit,
          collection
        );
        collection = database.getCollection(
          CircuitDatabase.Collections.CIRCUITS
        );
        this.removeSingleCircuitByIdFromCollection(
          circuit,
          collection
        );
        arg.data = circuit;
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * processes our event callback for when we close a wtf. This happens when the circuit
   * is already in a solved state, or after a retro state, and it could be used for review at a later point,
   * but otherwise we dont need it anymore
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateCloseWtfCallback(store, event, arg, callback) {
    if (store.error) {
      this.logMessage(
        "CircuitController",
        "error on close: " + store.error
      );
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.CIRCUIT
        ),
        circuit = store.data;

      if (circuit) {
        let collection = database.getCollection(
          CircuitDatabase.Collections.CIRCUITS
        );
        this.removeSingleCircuitByIdFromCollection(
          circuit,
          collection
        );

        collection = database.getCollection(
          CircuitDatabase.Collections.SOLVED
        );
        this.removeSingleCircuitByIdFromCollection(
          circuit,
          collection
        );

        collection = database.getCollection(
          CircuitDatabase.Collections.RETRO
        );
        this.removeSingleCircuitByIdFromCollection(
          circuit,
          collection
        );

        arg.data = circuit;
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles our event callback for when the user wants to pause a circuit and
   * mark it to do it later.
   * @param event
   * @param arg
   * @param callback
   */
  handlePauseWTFWithDoItLaterEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.DO_IT_LATER;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.PAUSE_WTF_WITH_DO_IT_LATER,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegatePauseWTFWithDoItLaterCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our callback for pausing a wtf. This function will call the same
   * function that our Resouce Circuit Controller uses for updating
   * these documents via talk. This function handles our redundancy.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegatePauseWTFWithDoItLaterCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * processes our event handler for resuming a wtf circuit
   * @param event
   * @param arg
   * @param callback
   */
  handleResumeWtfEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.RESUME;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.RESUME_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateResumeWtfCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles and processes the callback for our resume wtf capability for a
   * learning circuit.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateResumeWtfCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * handles our event callback for when the user wants to start the retro review
   * @param event
   * @param arg
   * @param callback
   */
  handleStartRetroForWTFEvent(event, arg, callback) {
    let name = arg.args.circuitName,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.RETRO;

    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      {},
      CircuitController.Names.START_RETRO_FOR_WTF,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateStartRetroForWTFCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our event callback for when the user wants to update the circuit description
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateCircuitDescription(event, arg, callback) {
    let name = arg.args.circuitName,
      description = arg.args.description,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.PROPERTY +
        CircuitController.Paths.DESCRIPTION;
    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      { description: description },
      CircuitController.Names.UPDATE_CIRCUIT_DESCRIPTION,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateUpdateDescriptionCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our event callback for when the user wants to save tags
   * @param event
   * @param arg
   * @param callback
   */
  handleSaveTags(event, arg, callback) {
    let name = arg.args.circuitName,
      tags = arg.args.tags,
      urn =
        CircuitController.Paths.CIRCUIT_WTF +
        CircuitController.Paths.SEPARATOR +
        name +
        CircuitController.Paths.PROPERTY +
        CircuitController.Paths.TAGS;
    this.doClientRequest(
      CircuitController.Contexts.CIRCUIT_CLIENT,
      { tags: tags },
      CircuitController.Names.SAVE_CIRCUIT_TAGS,
      CircuitController.Types.POST,
      urn,
      (store) =>
        this.delegateSaveTagsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our callback for starting a retro review. This is a complex workflow
   * which gridtime will trigger events based on various user events.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateStartRetroForWTFCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * processes our callback for saving a circuit description.
   * After the call, the updated circuit should be broadcast over talknet
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateUpdateDescriptionCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * processes our callback for saving circuit tags
   * After the call, the updated circuit should be broadcast over talknet
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateSaveTagsCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * removes a single circuit from our gridtime system and local database
   * @param circuit
   * @param collection
   */
  removeSingleCircuitByIdFromCollection(
    circuit,
    collection
  ) {
    if (circuit) {
      let model = collection.findOne({ id: circuit.id });
      if (model) {
        collection.remove(model);
      }
    }
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
    //since circuits can parish from a set while we were offline, delete the existing contents first
    collection.chain().remove();

    if (circuits && circuits.length > 0) {
      circuits.forEach((circuit) => {
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
