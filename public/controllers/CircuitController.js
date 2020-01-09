const log = require("electron-log"),
  BaseController = require("./BaseController"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {AppController}
 */
module.exports = class CircuitClientController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, CircuitClientController);
    this.configureEvents();
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
    BaseController.wireControllersTo(CircuitClientController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(CircuitClientController.instance);
  }

  /**
   * this function makes a request to the TalkToClient interface on gridtime server. This will be
   * worked into our existing data client and model system.
   */
  doClientRequest(context, dto, name, type, urn, callback) {
    log.info(this.name + " do dto client request");
    this.store = {
      context: context,
      dto: dto,
      guid: Util.getGuid(),
      name: name,
      requestType: type,
      timestamp: new Date().getTime(),
      urn: urn
    };
    let client = new DtoClient(this.store, callback);
    client.doRequest();
  }
};
