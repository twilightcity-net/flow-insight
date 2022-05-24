const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the circuit member service
 * @type {CircuitMemberController}
 */
module.exports = class CircuitMemberController extends (
  BaseController
) {
  /**
   * builds our CircuitMember Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, CircuitMemberController);
    if (!CircuitMemberController.instance) {
      CircuitMemberController.instance = this;
      CircuitMemberController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @constructor
   */
  static get Events() {
    return {
      GET_CIRCUIT_MEMBERS: "get-circuit-members-global"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      CircuitMemberController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CircuitMemberController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.CIRCUIT_MEMBER_CLIENT,
        this,
        this.onCircuitMemberClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onCircuitMemberClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        CircuitMemberController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case CircuitMemberController.Events.GET_CIRCUIT_MEMBERS:
          this.handleGetCircuitMembersEvent(event, arg);
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
  handleGetCircuitMembersEvent(event, arg, callback) {
    let circuitId = arg.args.circuitId,
      urn =
        CircuitMemberController.Paths.CIRCUIT +
        CircuitMemberController.Paths.GLOBAL +
        CircuitMemberController.Paths.SEPARATOR +
        circuitId +
        CircuitMemberController.Paths.MEMBER;

    this.doClientRequest(
      CircuitMemberController.Contexts.CIRCUIT_MEMBER_CLIENT,
      {},
      CircuitMemberController.Names.GET_CIRCUIT_MEMBERS_GLOBAL,
      CircuitMemberController.Types.GET,
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
