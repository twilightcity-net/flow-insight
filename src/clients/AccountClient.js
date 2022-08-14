import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this class is used to converse with gridtime about account details
 */
export class AccountClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for account requests in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[AccountClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.ACCOUNT_CLIENT,
      this,
      null,
      this.onAccountEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @constructor
   */
  static get Events() {
    return {
      INVITE_TO_BUDDY_LIST: "invite-to-buddy-list",
      INVITE_TO_TEAM: "invite-to-team",
      USE_INVITATION_KEY: "use-invitation-key",
      GET_COMMUNITY_OPTIONS_LIST: "get-community-options-list",
      GET_CURRENT_LOGGED_IN_COMMUNITY: "get-current-logged-in-community",
      SET_PRIMARY_COMMUNITY: "set-primary-community",
      RESTART_APP: "restart-app",
      GET_PLATFORM: "get-platform",
      UPDATE_ACCOUNT_USERNAME: "update-account-username",
      UPDATE_ACCOUNT_FULLNAME: "update-account-fullname",
      UPDATE_ACCOUNT_DISPLAYNAME: "update-account-displayname",
      GET_REGISTERED_PLUGIN_LIST: "get-registered-plugin-list",
      REGISTER_PLUGIN: "register-plugin"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!AccountClient.instance) {
      AccountClient.instance = new AccountClient(scope);
    }
  }

  /**
   * Invites a fervie to the buddy list via email, a talk message should
   * come back with the pending buddy request so we can add it to the view
   * @param email
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static inviteToBuddyList(
    email,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.INVITE_TO_BUDDY_LIST,
      {
        email: email
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Invites a member to the team, should send an email with
   * an activation code for downloading the app.  Then when logging in,
   * will automatically be added to the team
   * @param email
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static inviteToTeam(
    email,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.INVITE_TO_TEAM,
      {
        email: email
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Uses a keycode for this account, to be invited to an organization
   * or a team.  Invite codes will usually come via email
   * @param keycode
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static useInvitationKey(
    keycode,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.USE_INVITATION_KEY,
      {
        keycode: keycode
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Retrieves the set of community login options
   * that are returned at login
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getCommunityOptionsList(
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.GET_COMMUNITY_OPTIONS_LIST,
      {},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }



  /**
   * Retrieves the id of the currently logged in community
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getCurrentLoggedInCommunity(
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.GET_CURRENT_LOGGED_IN_COMMUNITY,
      {},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Sets the primary community as a specific orgId
   * or sets to "" to clear, and let the server choose the default
   * @param orgId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static setPrimaryCommunity(
    orgId,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.SET_PRIMARY_COMMUNITY,
      {orgId: orgId},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Restarts the application
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static restartApp(
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.RESTART_APP,
      {},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }



  /**
   * Get the platform architecture of the running client
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getPlatform(
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.GET_PLATFORM,
      {},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }

  /**
   * Get a list of the currently registered plugins
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getRegisteredPluginList(scope, callback) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.GET_REGISTERED_PLUGIN_LIST,
      {},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }


  /**
   * Register a plugin with a specific id
   * @param pluginId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static registerPlugin(pluginId, scope, callback) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.REGISTER_PLUGIN,
      {pluginId: pluginId},
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }

  /**
   * Updates the username associated with an account, will send a status update
   * message over talk if successful
   * @param username
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static updateAccountUsername(
    username,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.UPDATE_ACCOUNT_USERNAME,
      {
        username: username
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }



  /**
   * Updates the fullName associated with an account, will send a status update
   * message over talk if successful
   * @param fullName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static updateAccountFullName(
    fullName,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.UPDATE_ACCOUNT_FULLNAME,
      {
        fullName: fullName
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }




  /**
   * Updates the displayName associated with an account, will send a status update
   * message over talk if successful
   * @param displayName
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static updateAccountDisplayName(
    displayName,
    scope,
    callback
  ) {
    let event = AccountClient.instance.createClientEvent(
      AccountClient.Events.UPDATE_ACCOUNT_DISPLAYNAME,
      {
        displayName: displayName
      },
      scope,
      callback
    );

    AccountClient.instance.notifyAccount(event);
    return event;
  }



  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its recieved the response from the main process. the
   * call back is bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onAccountEventReply = (event, arg) => {
    let clientEvent = AccountClient.replies.get(arg.id);
    this.logReply(
      AccountClient.name,
      AccountClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      AccountClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process account that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main prcess thread
   * @param clientEvent
   */
  notifyAccount(clientEvent) {
    console.log(
      "[" +
        AccountClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    AccountClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}
