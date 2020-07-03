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
      ALARM: "alarm"
    };
  }

  /**
   * an enum of possible errors our clients can use
   * @returns {{UNKNOWN: string}}
   * @constructor
   */
  static get Errors() {
    return {
      UNKNOWN: "Unknown team panel menu item"
    };
  }

  /**
   * our possible message type for our controller reference
   * @returns {{WTF_STATUS_UPDATE: string, INTENTION_STARTED_DETAILS: string, ROOM_MEMBER_STATUS_EVENT: string, JOURNAL_ENTRY_DTO: string, TEAM_MEMBER: string, CIRCUIT_STATUS: string, CHAT_MESSAGE_DETAILS: string, XP_STATUS_UPDATE: string}}
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      ROOM_MEMBER_STATUS_EVENT: "RoomMemberStatusEventDto",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto",
      TEAM_MEMBER: "TeamMemberDto",
      XP_STATUS_UPDATE: "XPStatusUpdateDto",
      WTF_STATUS_UPDATE: "WTFStatusUpdateDto",
      INTENTION_STARTED_DETAILS:
        "IntentionStartedDetailsDto",
      JOURNAL_ENTRY_DTO: "JournalEntryDto"
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
