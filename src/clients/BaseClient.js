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
   * @returns {{LOADING: string, ME: string, PRIMARY: string, EMPTY: string, YOU: string, ONLINE: string, OFFLINE: string}}
   * @constructor
   */
  static get Strings() {
    return {
      ME: "me",
      EMPTY: "",
      YOU: " (you)",
      LOADING: "loading...",
      ONLINE: "online",
      OFFLINE: "offline"
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
   * @returns {{ROOM_MEMBER_STATUS_EVENT: string, CIRCUIT_STATUS: string, CHAT_MESSAGE_DETAILS: string}}
   * @constructor
   */
  static get MessageTypes() {
    return {
      CIRCUIT_STATUS: "CircuitStatusDto",
      ROOM_MEMBER_STATUS_EVENT: "RoomMemberStatusEventDto",
      CHAT_MESSAGE_DETAILS: "ChatMessageDetailsDto"
    };
  }

  /**
   * our enum of gridtime Circuit Message Types that talk broadcasts
   * @returns {{TEAM_MEMBER_STATUS_UPDATE: string, WTF_STARTED: string, TEAM_MEMBER_XP_UPDATE: string, CHAT: string, TEAM_WTF_RESUMED: string, ROOM_MEMBER_JOIN: string, ROOM_MEMBER_ONLINE: string, TEAM_WTF_STOPPED: string, WTF_RESUMED: string, WTF_SOLVED: string, SCREENSHOT: string, TEAM_RETRO_STARTED: string, SNIPPET: string, ROOM_MEMBER_LEAVE: string, TEAM_INTENTION_STARTED: string, WTF_RETRO_STARTED: string, WTF_ONHOLD: string, ROOM_MEMBER_OFFLINE: string, WTF_CANCELED: string, TEAM_WTF_STARTED: string}}
   * @constructor
   */
  static get CircuitMessageTypeDto() {
    return {
      CHAT: "ChatMessageDetailsDto",
      SCREENSHOT: "ScreenshotMessageDetailsDto",
      SNIPPET: "SnippetMessageDetailsDto",
      ROOM_MEMBER_JOIN: "RoomMemberStatus",
      ROOM_MEMBER_LEAVE: "RoomMemberStatus",
      ROOM_MEMBER_OFFLINE: "RoomMemberStatus",
      ROOM_MEMBER_ONLINE: "RoomMemberStatus",
      WTF_STARTED: "CircuitStatusDto",
      WTF_SOLVED: "CircuitStatusDto",
      WTF_ONHOLD: "CircuitStatusDto",
      WTF_RESUMED: "CircuitStatusDto",
      WTF_RETRO_STARTED: "CircuitStatusDto",
      WTF_CANCELED: "CircuitStatusDto",
      TEAM_INTENTION_STARTED: "IntentionStartedDetailsDto",
      TEAM_WTF_STARTED: "WTFStatusUpdateDto",
      TEAM_WTF_STOPPED: "WTFStatusUpdateDto",
      TEAM_WTF_RESUMED: "WTFStatusUpdateDto",
      TEAM_RETRO_STARTED: "WTFStatusUpdateDto",
      TEAM_MEMBER_STATUS_UPDATE: "MemberWorkStatusDto",
      TEAM_MEMBER_XP_UPDATE: "XPStatusUpdateDto"
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
