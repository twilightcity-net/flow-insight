const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the Moovie service
 * @type {MoovieController}
 */
module.exports = class MoovieController extends (
  BaseController
) {
  /**
   * builds our Moovie Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, MoovieController);
    if (!MoovieController.instance) {
      MoovieController.instance = this;
      MoovieController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for moovies
   * @constructor
   */
  static get Events() {
    return {
      CREATE_MOOVIE_CIRCUIT: "create-moovie-circuit",
      GET_MOOVIE_CIRCUITS: "get-moovie-circuits",
      GET_MOOVIE_CIRCUIT: "get-moovie-circuit",
      JOIN_MOOVIE: "join-moovie",
      LEAVE_MOOVIE: "leave-moovie",
      START_MOOVIE: "start-moovie",
      PAUSE_MOOVIE: "pause-moovie",
      RESUME_MOOVIE: "resume-moovie",
      CLAIM_SEAT: "claim-seat",
      RELEASE_SEAT: "release-seat",
      GET_SEAT_MAPPINGS: "get-seat-mappings"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      MoovieController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(MoovieController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.MOOVIE_CLIENT,
        this,
        this.onMoovieClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onMoovieClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        MoovieController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case MoovieController.Events.CREATE_MOOVIE_CIRCUIT:
          this.handleCreateMoovieEvent(event, arg);
          break;
        case MoovieController.Events.GET_MOOVIE_CIRCUITS:
          this.handleGetMooviesEvent(event, arg);
          break;
        case MoovieController.Events.GET_MOOVIE_CIRCUIT:
          this.handleGetMoovieCircuitEvent(event, arg);
          break;
        case MoovieController.Events.JOIN_MOOVIE:
          this.handleJoinMoovieEvent(event, arg);
          break;
        case MoovieController.Events.LEAVE_MOOVIE:
          this.handleLeaveMoovieEvent(event, arg);
          break;
        case MoovieController.Events.START_MOOVIE:
          this.handleStartMoovieEvent(event, arg);
          break;
        case MoovieController.Events.PAUSE_MOOVIE:
          this.handlePauseMoovieEvent(event, arg);
          break;
        case MoovieController.Events.RESUME_MOOVIE:
          this.handleResumeMoovieEvent(event, arg);
          break;
        case MoovieController.Events.CLAIM_SEAT:
          this.handleClaimSeatEvent(event, arg);
          break;
        case MoovieController.Events.RELEASE_SEAT:
          this.handleReleaseSeatEvent(event, arg);
          break;
        case MoovieController.Events.GET_SEAT_MAPPINGS:
          this.handleGetSeatMappingsEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown fervie client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * client event handler for creating a new moovie
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateMoovieEvent(event, arg, callback) {
    let title = arg.args.title,
      year = arg.args.year,
      link = arg.args.link,
      urn =
        MoovieController.Paths.MOOVIE;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {
        title: title,
        year: year,
        link: link
      },
      MoovieController.Names.CREATE_MOOVIE_CIRCUIT,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }



  /**
   * client event handler for retrieving all active moovie circuits
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMooviesEvent(event, arg, callback) {
    let urn =
        MoovieController.Paths.MOOVIE;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.GET_MOOVIE_CIRCUITS,
      MoovieController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }




  /**
   * client event handler for retrieving a single moovie circuit
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMoovieCircuitEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
      MoovieController.Paths.MOOVIE +
      MoovieController.Paths.SEPARATOR +
      circuitId;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.GET_MOOVIE_CIRCUIT,
      MoovieController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for claiming a seat in a moovie theatre
   * @param event
   * @param arg
   * @param callback
   */
  handleClaimSeatEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      row = arg.args.row,
      seat = arg.args.seat,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.SEAT +
        MoovieController.Paths.CLAIM;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {row: row, seat: seat},
      MoovieController.Names.CLAIM_SEAT,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for release a seat in a moovie theatre
   * @param event
   * @param arg
   * @param callback
   */
  handleReleaseSeatEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.SEAT +
        MoovieController.Paths.RELEASE;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.RELEASE_SEAT,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for getting all the seat mappings for a theater
   * @param event
   * @param arg
   * @param callback
   */
  handleGetSeatMappingsEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.SEAT;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.GET_SEAT_MAPPINGS,
      MoovieController.Types.GET,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * client event handler for joining an existing moovie
   * @param event
   * @param arg
   * @param callback
   */
  handleJoinMoovieEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.JOIN;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.JOIN_MOOVIE,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for leaving an existing moovie
   * @param event
   * @param arg
   * @param callback
   */
  handleLeaveMoovieEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.LEAVE;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.LEAVE_MOOVIE,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for starting the timer of an existing moovie
   * @param event
   * @param arg
   * @param callback
   */
  handleStartMoovieEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.START;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.START_MOOVIE,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for pausing the timer of an existing moovie
   * @param event
   * @param arg
   * @param callback
   */
  handlePauseMoovieEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.PAUSE;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.PAUSE_MOOVIE,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }


  /**
   * client event handler for resuming the timer of an existing moovie
   * @param event
   * @param arg
   * @param callback
   */
  handleResumeMoovieEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        MoovieController.Paths.MOOVIE +
        MoovieController.Paths.SEPARATOR +
        circuitId +
        MoovieController.Paths.RESUME;

    this.doClientRequest(
      MoovieController.Contexts.MOOVIE_CLIENT,
      {},
      MoovieController.Names.RESUME_MOOVIE,
      MoovieController.Types.POST,
      urn,
      (store) =>
        this.defaultDelegateCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  defaultDelegateCallback(store, event, arg, callback) {
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
};
