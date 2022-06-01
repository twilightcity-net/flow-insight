const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the Fervie service
 * @type {FervieController}
 */
module.exports = class FervieController extends (
  BaseController
) {
  /**
   * builds our Fervie Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FervieController);
    if (!FervieController.instance) {
      FervieController.instance = this;
      FervieController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for fervie
   * @returns {{HAS_OUTGOING_PAIR_REQUEST:string, CANCEL_PAIR_REQUEST:string, SAVE_FERVIE_DETAILS: string, REQUEST_PAIR_LINK:string, CONFIRM_PAIR_LINK:string, STOP_PAIRING:string}}
   * @constructor
   */
  static get Events() {
    return {
      SAVE_FERVIE_DETAILS: "save-fervie-details",
      REQUEST_PAIR_LINK: "request-pair-link",
      CONFIRM_PAIR_LINK: "confirm-pair-link",
      STOP_PAIRING: "stop-pairing",
      CANCEL_PAIR_REQUEST: "cancel-pair-request",
      HAS_OUTGOING_PAIR_REQUEST: "has-outgoing-pair-request"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      FervieController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(FervieController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.FERVIE_CLIENT,
        this,
        this.onFervieClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onFervieClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        FervieController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FervieController.Events.SAVE_FERVIE_DETAILS:
          this.handleSaveFervieDetailsEvent(event, arg);
          break;
        case FervieController.Events.REQUEST_PAIR_LINK:
          this.handleRequestPairLinkEvent(event, arg);
          break;
        case FervieController.Events.CONFIRM_PAIR_LINK:
          this.handleConfirmPairLinkEvent(event, arg);
          break;
        case FervieController.Events.STOP_PAIRING:
          this.handleStopPairingEvent(event, arg);
          break;
        case FervieController.Events.CANCEL_PAIR_REQUEST:
          this.handleCancelPairRequestEvent(event, arg);
          break;
        case FervieController.Events.HAS_OUTGOING_PAIR_REQUEST:
          this.handleHasOutgoingPairRequestEvent(event, arg);
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
   * client event handler for our save fervie details function
   * @param event
   * @param arg
   * @param callback
   */
  handleSaveFervieDetailsEvent(event, arg, callback) {
    let fervieColor = arg.args.fervieColor,
      fervieSecondaryColor = arg.args.fervieSecondaryColor,
      fervieTertiaryColor = arg.args.fervieTertiaryColor,
      fervieAccessory = arg.args.fervieAccessory,
      fervieName = arg.args.fervieName,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        FervieController.Strings.ME;

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {
        fervieColor: fervieColor,
        fervieSecondaryColor: fervieSecondaryColor,
        fervieTertiaryColor: fervieTertiaryColor,
        fervieAccessory: fervieAccessory,
        fervieName: fervieName
      },
      FervieController.Names.SAVE_FERVIE_DETAILS,
      FervieController.Types.POST,
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
   * client event handler to get any outgoing pair request to a specific member
   * @param event
   * @param arg
   * @param callback
   */
  handleHasOutgoingPairRequestEvent(event, arg, callback) {
    let memberId = arg.args.memberId;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    arg.data = database.hasPairRequest(memberId);

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );

  }



  /**
   * client event handler for our pairing request
   * @param event
   * @param arg
   * @param callback
   */
  handleRequestPairLinkEvent(event, arg, callback) {
    let memberId = arg.args.memberId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        memberId +
        FervieController.Paths.PAIR +
        FervieController.Paths.LINK +
        FervieController.Paths.REQUEST;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    database.addOutgoingPairRequest(memberId);

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.REQUEST_PAIR_LINK,
      FervieController.Types.POST,
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
   * client event handler for confirming our pairing request
   * @param event
   * @param arg
   * @param callback
   */
  handleConfirmPairLinkEvent(event, arg, callback) {
    let fromMemberId = arg.args.fromMemberId,
      toMemberId = arg.args.toMemberId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        fromMemberId +
        FervieController.Paths.PAIR +
        FervieController.Paths.LINK +
        FervieController.Paths.CONFIRM;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    let notifications = database.findByMemberIdAndType(fromMemberId, "PAIRING_REQUEST");
    console.log("Found notifications: "+notifications.length);
    for (let notification of notifications) {
      database.deleteNotificationById(notification.id);
    }

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.CONFIRM_PAIR_LINK,
      FervieController.Types.POST,
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
   * client event handler for our stop pairing request
   * @param event
   * @param arg
   * @param callback
   */
  handleStopPairingEvent(event, arg, callback) {
    let urn =
      FervieController.Paths.FERVIE +
      FervieController.Paths.ME +
      FervieController.Paths.PAIR +
      FervieController.Paths.UNLINK;

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.STOP_PAIRING,
      FervieController.Types.POST,
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
   * client event handler for our cancel pairing request
   * @param event
   * @param arg
   * @param callback
   */
  handleCancelPairRequestEvent(event, arg, callback) {
    let memberId = arg.args.memberId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        memberId +
        FervieController.Paths.PAIR +
        FervieController.Paths.LINK +
        FervieController.Paths.CANCEL;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    database.removePairRequest(memberId);

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.CANCEL_PAIR_REQUEST,
      FervieController.Types.POST,
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
      //details will be pushed to team member DB, so we dont need to save separately
      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
