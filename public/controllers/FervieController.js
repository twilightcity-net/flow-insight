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
   * @constructor
   */
  static get Events() {
    return {
      SAVE_FERVIE_DETAILS: "save-fervie-details",
      REQUEST_PAIR_LINK: "request-pair-link",
      CONFIRM_PAIR_LINK: "confirm-pair-link",
      STOP_PAIRING: "stop-pairing",
      CANCEL_PAIR_REQUEST: "cancel-pair-request",
      HAS_OUTGOING_PAIR_REQUEST: "has-outgoing-pair-request",
      REQUEST_BUDDY_LINK: "request-buddy-link",
      CONFIRM_BUDDY_LINK: "confirm-buddy-link",
      REMOVE_BUDDY_LINK: "remove-buddy-link",
      GET_BUDDY_ME: "get-buddy-me",
      GET_BUDDY_LIST: "get-buddy-list",
      GET_PENDING_BUDDY_REQUEST_LIST: "get-pending-buddy-request-list",
      LOAD_BUDDY_LIST: "load-buddy-list"
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
        case FervieController.Events.REQUEST_BUDDY_LINK:
          this.handleRequestBuddyLinkEvent(event, arg);
          break;
        case FervieController.Events.CONFIRM_BUDDY_LINK:
          this.handleConfirmBuddyLinkEvent(event, arg);
          break;
        case FervieController.Events.REMOVE_BUDDY_LINK:
          this.handleRemoveBuddyLinkEvent(event, arg);
          break;
        case FervieController.Events.GET_BUDDY_LIST:
          this.handleGetBuddyListEventWithFallback(event, arg);
          break;
        case FervieController.Events.GET_BUDDY_ME:
          this.handleGetBuddyMeEvent(event, arg);
          break;
        case FervieController.Events.GET_PENDING_BUDDY_REQUEST_LIST:
          this.handleGetPendingBuddyListEvent(event, arg);
          break;
        case FervieController.Events.LOAD_BUDDY_LIST:
          this.handleLoadBuddyListEvent(event, arg);
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
   * client event handler for our getting all our buddies
   * @param event
   * @param arg
   * @param callback
   */
  handleGetBuddyListEventWithFallback(event, arg, callback) {

    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

    if (this.isBuddyListLoaded) {
      let view = database.getViewForBuddies();
      arg.data = view.data();

      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    } else {
      this.handleLoadBuddyListEvent({}, {}, (args) => {
        if (args.error) {
          arg.error = args.error;
        }
        if (args.data) {
          let view = database.getViewForBuddies();
          arg.data = view.data();
        }

        this.delegateCallbackOrEventReplyTo(
          event,
          arg,
          callback
        );
      });
    }
  }



  /**
   * client event handler for our getting the me fervieDto from our
   * buddy representation
   * @param event
   * @param arg
   * @param callback
   */
  handleGetBuddyMeEvent(event, arg, callback) {

    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

    if (this.isBuddyListLoaded) {

      arg.data = database.getBuddyMe();

      this.delegateCallbackOrEventReplyTo(
        event,
        arg,
        callback
      );
    }
  }


  /**
   * client event handler for our getting all our pending buddies
   * @param event
   * @param arg
   * @param callback
   */
  handleGetPendingBuddyListEvent(event, arg, callback) {

    let database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

    let view = database.getViewForPendingBuddies();
    arg.data = view.data();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );

  }


  /**
   * client event handler for loading all our buddies in the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadBuddyListEvent(event, arg, callback) {
    let urn =
      FervieController.Paths.FERVIE +
      FervieController.Paths.SEPARATOR +
      FervieController.Strings.ME +
      FervieController.Paths.BUDDY;

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.GET_BUDDY_LIST,
      FervieController.Types.GET,
      urn,
      (store) =>
        this.loadBuddiesIntoDB(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * Add the returned buddy to the database
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  addBuddyToDB(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;

      const database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

      if (arg.data) {
        database.addOrUpdateBuddy(arg.data);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Remove the requested buddy from the local database
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  removeBuddyFromDB(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;

      const database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

      database.removeBuddy(arg.args.buddyMemberId);
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * Load all our queried buddies into the database
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  loadBuddiesIntoDB(store, event, arg, callback) {
      if (store.error) {
        arg.error = store.error;
        this.isBuddyListLoaded = false;
      } else {
        arg.data = store.data;
        const buddyMe = arg.data.me;
        const buddyList = arg.data.buddies;
        const pendingRequests = arg.data.pendingBuddyRequests;

        const database = DatabaseFactory.getDatabase(DatabaseFactory.Names.BUDDY);

        if (buddyMe) {
          database.loadBuddyMe(buddyMe);
        }

        if (buddyList) {
          database.loadBuddyList(buddyList);
        }

        if (pendingRequests) {
          database.loadPendingRequests(pendingRequests);
        }

        this.isBuddyListLoaded = true;
      }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * client event handler for confirming a buddy request
   * @param event
   * @param arg
   * @param callback
   */
  handleConfirmBuddyLinkEvent(event, arg, callback) {

    let requestingMemberId = arg.args.requestingMemberId,
      buddyRequestId = arg.args.buddyRequestId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        requestingMemberId +
        FervieController.Paths.BUDDY +
        FervieController.Paths.LINK +
        FervieController.Paths.CONFIRM;

    console.log("buddy requestId = "+buddyRequestId);

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {buddyRequestId: buddyRequestId},
      FervieController.Names.CONFIRM_BUDDY_LINK,
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
   * client event handler for adding a member to your buddy list, sends a request
   * @param event
   * @param arg
   * @param callback
   */
  handleRequestBuddyLinkEvent(event, arg, callback) {
    let buddyMemberId = arg.args.buddyMemberId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        buddyMemberId +
        FervieController.Paths.BUDDY +
        FervieController.Paths.LINK +
        FervieController.Paths.REQUEST;

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.REQUEST_BUDDY_LINK,
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
   * client event handler for removing a member from your buddy list
   * @param event
   * @param arg
   * @param callback
   */
  handleRemoveBuddyLinkEvent(event, arg, callback) {
    let buddyMemberId = arg.args.buddyMemberId,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        buddyMemberId +
        FervieController.Paths.BUDDY +
        FervieController.Paths.LINK +
        FervieController.Paths.REMOVE;

    this.doClientRequest(
      FervieController.Contexts.FERVIE_CLIENT,
      {},
      FervieController.Names.REMOVE_BUDDY_LINK,
      FervieController.Types.POST,
      urn,
      (store) =>
        this.removeBuddyFromDB(
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
      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


};
