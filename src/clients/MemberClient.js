import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our team service
 */
export class MemberClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * stores a static reference of our current user logged in
   * @type {TeamMemberDto}
   */
  static me = null;

  /**
   * builds the Client for a Team in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[MemberClient]");
    this.clientEvent = RendererEventFactory.createEvent(
      RendererEventFactory.Events.MEMBER_CLIENT,
      this,
      null,
      this.onMemberEventReply
    );
    this.meDataRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.ME_DATA_REFRESH,
        this,
        this.onMeRefresh
      );

    this.controllerEvent = RendererEventFactory.createEvent(
      RendererEventFactory.Events.MEMBER_CONTROLLER,
      this,
      this.onMemberEventCallback
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @constructor
   */
  static get Events() {
    return {
      UPDATE_ME: "update-me",
      LOAD_ME: "load-me",
      GET_ME: "get-me",
      GET_MEMBER: "get-member",
      GET_MEMBER_BY_ID: "get-member-by-id",
      VIEW_CONSOLE_ME_UPDATE: "view-console-me-update",
      GET_ORG_OWNER_DETAILS: "get-org-owner-details"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!MemberClient.instance) {
      MemberClient.instance = new MemberClient(scope);
      MemberClient.getMe(this, (arg) => {
        MemberClient.me = arg.data;

        //work around because console sidebar getting loaded before init, so dispatch update event on it
        this.meUpdateNotifier =
          RendererEventFactory.createEvent(
            RendererEventFactory.Events
              .VIEW_CONSOLE_ME_UPDATE,
            this
          );
        this.meUpdateNotifier.dispatch(1);
      });
    }
  }

  /**
   * Initialization routine to load up the me object into the local store
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static loadMe(scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.LOAD_ME,
      {},
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  /**
   * Retrieve the me object from the local store
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMe(scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.GET_ME,
      {},
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  /**
   * Retrieve a user's member object from the local store,
   * using the username
   * @param username
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMember(username, scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.GET_MEMBER,
      { username: username },
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  /**
   * Retrieve a user's member object from the local store, using the id
   * @param memberId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getMemberById(memberId, scope, callback) {
    console.log("getMemberById "+memberId);
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.GET_MEMBER_BY_ID,
      { memberId: memberId },
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  /**
   * Returns an object indicating whether the logged in user
   * is the owner of the org.  Will enable actions for owner-only
   * features
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getOrgOwnerDetails(scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.GET_ORG_OWNER_DETAILS,
      {},
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }


  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onMemberEventReply = (event, arg) => {
    let clientEvent = MemberClient.replies.get(arg.id);
    this.logReply(
      MemberClient.name,
      MemberClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      MemberClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * Force refresh of me object that happens on disconnect and refresh
   */
  onMeRefresh() {
    MemberClient.getMe(this, (arg) => {
      MemberClient.me = arg.data;
    });
  }

  /**
   * processes any controller based event that is in the main process specifically
   * for the member controller.
   * @param event
   * @param arg
   */
  onMemberEventCallback = (event, arg) => {
    switch (arg.type) {
      case MemberClient.Events.UPDATE_ME:
        MemberClient.me = arg.data;
        break;
      default:
        throw new Error(
          MemberClient.Error.UNKNOWN +
            " '" +
            arg.type +
            "'."
        );
    }
  };

  /**
   * notifies the main process member that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyMember(clientEvent) {
    console.log(
      "[" +
        MemberClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    MemberClient.replies.set(clientEvent.id, clientEvent);
    this.clientEvent.dispatch(clientEvent, true);
  }
}
