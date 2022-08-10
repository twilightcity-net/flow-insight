const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");
const DatabaseFactory = require("../database/DatabaseFactory");

/**
 * This class is used to coordinate calls to gridtime for the Account service
 * @type {AccountController}
 */
module.exports = class AccountController extends (
  BaseController
) {

  /**
   * builds our Account Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, AccountController);
    if (!AccountController.instance) {
      AccountController.instance = this;
      AccountController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for fervie
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
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      AccountController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(AccountController.instance);
    this.fervieClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.ACCOUNT_CLIENT,
        this,
        this.onAccountClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onAccountClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        AccountController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case AccountController.Events.UPDATE_ACCOUNT_USERNAME:
          this.handleUpdateAccountUsernameEvent(event, arg);
          break;
        case AccountController.Events.UPDATE_ACCOUNT_FULLNAME:
          this.handleUpdateAccountFullnameEvent(event, arg);
          break;
        case AccountController.Events.UPDATE_ACCOUNT_DISPLAYNAME:
          this.handleUpdateAccountDisplaynameEvent(event, arg);
          break;
         case AccountController.Events.INVITE_TO_BUDDY_LIST:
          this.handleInviteToBuddyListEvent(event, arg);
          break;
        case AccountController.Events.INVITE_TO_TEAM:
          this.handleInviteToTeamEvent(event, arg);
          break;
        case AccountController.Events.USE_INVITATION_KEY:
          this.handleUseInvitationKeyEvent(event, arg);
          break;
        case AccountController.Events.GET_COMMUNITY_OPTIONS_LIST:
          this.handleGetCommunityOptionsEvent(event, arg);
          break;
        case AccountController.Events.GET_CURRENT_LOGGED_IN_COMMUNITY:
          this.handleGetCurrentLoggedInCommunityEvent(event, arg);
          break;
        case AccountController.Events.SET_PRIMARY_COMMUNITY:
          this.handleSetPrimaryCommunityEvent(event, arg);
          break;
        case AccountController.Events.GET_REGISTERED_PLUGIN_LIST:
          this.handleGetRegisteredPluginListEvent(event, arg);
          break;
        case AccountController.Events.REGISTER_PLUGIN:
          this.handleRegisterPluginEvent(event, arg);
          break;
        case AccountController.Events.RESTART_APP:
          this.handleRestartAppEvent(event, arg);
          break;
        case AccountController.Events.GET_PLATFORM:
          this.handleGetPlatformEvent(event, arg);
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
   * Update the account username, must be globally unique
   * will send back an error message if the username is already taken
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateAccountUsernameEvent(event, arg, callback) {
    let username = arg.args.username,
      urn =
        AccountController.Paths.ACCOUNT +
        AccountController.Paths.PROFILE +
        AccountController.Paths.ORGANIZATION +
        AccountController.Paths.PROPERTY +
        AccountController.Paths.USERNAME;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {username : username},
      AccountController.Names.UPDATE_ACCOUNT_USERNAME,
      AccountController.Types.POST,
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
   * Update the account fullName
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateAccountFullnameEvent(event, arg, callback) {
    let fullName = arg.args.fullName,
      urn =
        AccountController.Paths.ACCOUNT +
        AccountController.Paths.PROFILE +
        AccountController.Paths.ROOT +
        AccountController.Paths.PROPERTY +
        AccountController.Paths.FULLNAME;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {fullName : fullName},
      AccountController.Names.UPDATE_ACCOUNT_FULLNAME,
      AccountController.Types.POST,
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
   * Update the account displayName
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateAccountDisplaynameEvent(event, arg, callback) {
    let displayName = arg.args.displayName,
      urn =
        AccountController.Paths.ACCOUNT +
        AccountController.Paths.PROFILE +
        AccountController.Paths.ROOT +
        AccountController.Paths.PROPERTY +
        AccountController.Paths.DISPLAYNAME;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {displayName : displayName},
      AccountController.Names.UPDATE_ACCOUNT_DISPLAYNAME,
      AccountController.Types.POST,
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
   * client event handler for inviting a buddy to list using email
   * @param event
   * @param arg
   * @param callback
   */
  handleInviteToBuddyListEvent(event, arg, callback) {
    let email = arg.args.email,
      urn =
        AccountController.Paths.INVITE +
        AccountController.Paths.TO +
        AccountController.Paths.BUDDY +
        AccountController.Paths.WITH +
        AccountController.Paths.EMAIL;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {email : email},
      AccountController.Names.INVITE_TO_BUDDY_LIST_WITH_EMAIL,
      AccountController.Types.POST,
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
   * client event handler for inviting a member to the team via email.
   * For the org, domain restrictions apply depending on the org subscription
   * @param event
   * @param arg
   * @param callback
   */
  handleInviteToTeamEvent(event, arg, callback) {
    let email = arg.args.email,
      urn =
        AccountController.Paths.INVITE +
        AccountController.Paths.TO +
        AccountController.Paths.TEAM +
        AccountController.Paths.WITH +
        AccountController.Paths.EMAIL;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {email : email},
      AccountController.Names.INVITE_TO_TEAM_WITH_EMAIL,
      AccountController.Types.POST,
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
   * client event handler for using an invitation key on this account.
   * Usually an invite for an organization or team
   * @param event
   * @param arg
   * @param callback
   */
  handleUseInvitationKeyEvent(event, arg, callback) {
    let keycode = arg.args.keycode,
      urn = AccountController.Paths.INVITATION;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {invitationKey : keycode},
      AccountController.Names.USE_INVITATION_KEY,
      AccountController.Types.POST,
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
   * client event handler for registering a new plugin
   * @param event
   * @param arg
   * @param callback
   */
  handleRegisterPluginEvent(event, arg, callback) {
    let pluginId = arg.args.pluginId,
    urn =
        AccountController.Paths.ACCOUNT +
        AccountController.Paths.PLUGIN +
        AccountController.Paths.REGISTRATION;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {pluginId : pluginId},
      AccountController.Names.REGISTER_PLUGIN,
      AccountController.Types.POST,
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
   * client event handler for getting a list of registered plugins
   * @param event
   * @param arg
   * @param callback
   */
  handleGetRegisteredPluginsListEvent(event, arg, callback) {
    let urn =
      AccountController.Paths.ACCOUNT +
      AccountController.Paths.PLUGIN +
      AccountController.Paths.REGISTRATION;

    this.doClientRequest(
      AccountController.Contexts.ACCOUNT_CLIENT,
      {},
      AccountController.Names.GET_REGISTERED_PLUGIN_LIST,
      AccountController.Types.GET,
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
   * client event handler for getting all available community/org
   * options for logging in, and switching to
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCommunityOptionsEvent(event, arg, callback) {
    const status = global.App.connectionStatus;
    if (status) {
      arg.data = status.participatingOrgs;
    } else {
      arg.error = "status not available"
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * client event handler for getting all available community/org
   * options for logging in, and switching to
   * @param event
   * @param arg
   * @param callback
   */
  handleGetCurrentLoggedInCommunityEvent(event, arg, callback) {
    const status = global.App.connectionStatus;
    if (status) {
      arg.data = {orgId: status.orgId};
    } else {
      arg.error = "status not available"
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * client event handler for setting the primary
   * org to login.  Requires a restart to take effect
   * @param event
   * @param arg
   * @param callback
   */
  handleSetPrimaryCommunityEvent(event, arg, callback) {
    const orgId = arg.args.orgId;
    global.App.AppSettings.setPrimaryOrganizationId(orgId);

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * client event handler for setting the primary
   * org to login.  Requires a restart to take effect
   * @param event
   * @param arg
   * @param callback
   */
  handleRestartAppEvent(event, arg, callback) {
    global.App.restart();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * client event handler for getting the current architecture platform
   * @param event
   * @param arg
   * @param callback
   */
  handleGetPlatformEvent(event, arg, callback) {

    arg.data = {appPlatform: process.platform};

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
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
