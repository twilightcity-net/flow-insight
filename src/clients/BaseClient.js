import UtilRenderer from "../UtilRenderer";
import { RendererClientEvent } from "../events/RendererClientEvent";

/**
 * general base client class that all of our client extend from
 */
export class BaseClient {
  /**
   * static reference of our client
   */
  static instance;

  /**
   * generic strings for use by our clients
   * @returns {{LOADING: string, ALARM: string, ME: string, EMPTY: string, YOU: string, ONLINE: string, OFFLINE: string}}
   * @constructor
   */
  static get Strings() {
    return {
      ME: "me",
      EMPTY: "",
      YOU: " (you)",
      LOADING: "loading...",
      ONLINE: "online",
      OFFLINE: "offline",
      ALARM: "alarm",
    };
  }

  /**
   * an enum of possible errors our clients can use
   * @returns {{UNKNOWN: string}}
   * @constructor
   */
  static get Errors() {
    return {
      UNKNOWN: "Unknown team panel menu item",
    };
  }

  /**
   * our possible message type for our controller reference
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      CIRCUIT_MEMBER_STATUS_EVENT:
        "CircuitMemberStatusEventDto",
      ROOM_MEMBER_STATUS_EVENT: "RoomMemberStatusEventDto",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto",
      TEAM_MEMBER: "TeamMemberDto",
      TEAM_MEMBER_ADDED: "TeamMemberAddedEventDto",
      TEAM_MEMBER_REMOVED: "TeamMemberRemovedEventDto",
      XP_STATUS_UPDATE: "XPStatusUpdateDto",
      WTF_STATUS_UPDATE: "WTFStatusUpdateDto",
      INTENTION_STARTED_DETAILS:
        "IntentionStartedDetailsDto",
      INTENTION_FINISHED_DETAILS:
        "IntentionFinishedDetailsDto",
      INTENTION_ABORTED_DETAILS:
        "IntentionAbortedDetailsDto",
      JOURNAL_ENTRY_DTO: "JournalEntryDto",
      DICTIONARY_UPDATE: "WordDefinitionDto",
      TERMINAL_CMD_RESULT: "TerminalResultsDto",
      TERMINAL_ENVVARIABLE: "EnvironmentVariableDto",
      TERMINAL_CIRCUIT_CLOSED: "CircuitClosedDto",
      PAIRING_REQUEST: "PairingRequestDto",
      FERVIE_SEAT_EVENT: "FervieSeatEventDto",
      MOOVIE_STATUS_UPDATE: "MoovieCircuitDto",
    };
  }

  static get PairingRequestTypes() {
    return {
      PAIRING_REQUEST: "PAIRING_REQUEST",
      PAIRING_CANCELLATION: "PAIRING_CANCELLATION",
      PAIRING_CONFIRMED: "PAIRING_CONFIRMED",
    };
  }

  /**
   * a list of our various circuit states
   * @returns {{ON_HOLD: string, CANCELED: string, TROUBLESHOOT: string}}
   * @constructor
   */
  static get CircuitStates() {
    return {
      TROUBLESHOOT: "TROUBLESHOOT",
      CANCELED: "CANCELED",
      ON_HOLD: "ONHOLD",
      SOLVED: "SOLVED",
      RETRO: "RETRO",
      CLOSED: "CLOSED",
    };
  }

  /**
   * a static list of the types of room member status that are generated by
   * gridtime and sent over talk network.
   * @returns {{ROOM_MEMBER_LEAVE: string, ROOM_MEMBER_JOIN: string}}
   * @constructor
   */
  static get RoomMemberStatus() {
    return {
      ROOM_MEMBER_JOIN: "ROOM_MEMBER_JOIN",
      ROOM_MEMBER_LEAVE: "ROOM_MEMBER_LEAVE",
    };
  }

  /**
   * a static list of the types of circuit member status that are generated by
   * gridtime and sent over talk network.
   * @returns {{ROOM_MEMBER_LEAVE: string, ROOM_MEMBER_JOIN: string}}
   * @constructor
   */
  static get CircuitMemberStatus() {
    return {
      CIRCUIT_MEMBER_JOIN: "CIRCUIT_MEMBER_JOIN",
      CIRCUIT_MEMBER_LEAVE: "CIRCUIT_MEMBER_LEAVE",
      CIRCUIT_MEMBER_STATUS_UPDATE:
        "CIRCUIT_MEMBER_STATUS_UPDATE",
    };
  }

  /**
   * builds our base client class
   * @param scope
   * @param name
   */
  constructor(scope, name) {
    this.name = "[" + name + "]";
    this.scope = scope;
    this.guid = UtilRenderer.getGuid();
  }

  /**
   * figures our what to do with our callback for clients
   * @param event
   * @param arg
   * @param callback
   */
  delegateCallback(event, arg, callback) {
    if (callback) {
      callback(arg);
    }
  }

  /**
   * builds a new renderer client event from a given set of parameters
   * @param type
   * @param args
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  createClientEvent(type, args, scope, callback) {
    return new RendererClientEvent(
      type,
      args,
      scope,
      (event, arg) =>
        this.delegateCallback(event, arg, callback)
    );
  }

  /**
   * logs a reply event from our client in the main process
   * @param name
   * @param size
   * @param id
   * @param type
   */
  logReply(name, size, id, type) {
    console.log(
      "[" +
        name +
        "] reply {" +
        size +
        "} : " +
        id +
        " -> " +
        type
    );
  }
}
