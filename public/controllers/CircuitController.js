const log = require("electron-log"),
  BaseController = require("./BaseController"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  {DtoClient} = require("../managers/DtoClientFactory"),
  SimpleStatusDto = require("../dto/SimpleStatusDto");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {AppController}
 */
class CircuitController extends BaseController {
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
      CREATE_NAMED_CIRCUIT: "create-named-circuit", //name
      START_RETRO: "start-retro", //name
      JOIN_CIRCUIT: "join-circuit", //name
      LEAVE_CIRCUIT: "leave-circuit", //name
      CLOSE_CIRCUIT: "close-circuit", //name
      HOLD_CIRCUIT: "hold-circuit", //name
      RESUME_CIRCUIT: "resume-circuit", //name
      GET_CIRCUIT_MEMBERS: "get-circuit-members", //name
      GET_MY_CIRCUIT: "get-my-circuit",
      GET_MY_CIRCUIT_HOLDS: "get-my-circuit-holds",
      GET_MY_CIRCUITS_JOINED: "get-my-circuit-joined",
      GET_MEMBER_CIRCUIT_JOINED: "get-member-circuit-joined" //memberId
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
      this.scope,
      this.onCircuitClientEvent,
      null,
      true
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onCircuitClientEvent(event, arg) {
    log.info(this.name + " event received : " + JSON.stringify(arg));
    if (arg.type === CircuitController.EventTypes.CREATE_CIRCUIT) {
      let circuitManager = CircuitController.instance.scope;
      return circuitManager.createLearningCircuit(arg.arg, dto => {
        return dto;
      });
    }
    else {
      return new SimpleStatusDto({
        message: "unknown circuit client event type '" + arg.type + "'",
        status: "INVALID"
      });
    }
  }

  /**
   * this function makes a request to the TalkToClient interface on gridtime server. This will be
   * worked into our existing data client and model system.
   * @param context
   * @param dto
   * @param name
   * @param type
   * @param urn
   * @param callback
   */
  static doClientRequest(context, dto, name, type, urn, callback) {
    let store = {
      context: context,
      dto: dto,
      guid: Util.getGuid(),
      name: name,
      requestType: type,
      timestamp: new Date().getTime(),
      urn: urn
    };
    let client = new DtoClient(store, callback);
    client.doRequest();
  }
}

module.exports = CircuitController;
