const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  { DtoClient } = require("../managers/DtoClientFactory"),
  LearningCircuitDto = require("../dto/LearningCircuitDto");

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
    log.info(chalk.green(this.name) + " event : " + JSON.stringify(arg));
    switch (arg.type) {
      case CircuitController.EventTypes.CREATE_CIRCUIT:
        this.handleCreateCircuitEvent(event, arg);
        break;
      default:
        throw new Error(
          "Unknown circuit client event type '" + arg.type + "'."
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
        arg.dto = new LearningCircuitDto(store.data);
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
  doClientRequest(context, dto, name, type, urn, callback) {
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
