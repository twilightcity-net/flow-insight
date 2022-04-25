const BaseController = require("./BaseController"),
  ControllerEvent = require("../events/ControllerEvent"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  MemberDatabase = require("../database/MemberDatabase");

/**
 * This class is used to coordinate controllers across the member service
 * @type {MemberController}
 */
class MemberController extends BaseController {
  /**
   * builds our Member Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, MemberController);
    if (!MemberController.instance) {
      MemberController.instance = this;
      MemberController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible member events
   * @returns {{GET_MEMBER:string, UPDATE_ME: string, LOAD_ME: string, GET_ME: string}}
   */
  static get Events() {
    return {
      UPDATE_ME: "update-me",
      LOAD_ME: "load-me",
      GET_ME: "get-me",
      GET_MEMBER: "get-member",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      MemberController.instance
    );
  }

  /**
   * configures our client event  which is used to share information between
   * our client side and controller side.
   */
  configureEvents() {
    BaseController.configEvents(MemberController.instance);
    this.memberClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.MEMBER_CLIENT,
        this,
        this.onMemberClientEvent
      );
    this.memberClientEventNotifier =
      EventFactory.createEvent(
        EventFactory.Types.MEMBER_CONTROLLER,
        this
      );
  }

  /**
   * notified when we get a member event
   * @param event
   * @param arg
   * @returns {string}
   */
  onMemberClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        MemberController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case MemberController.Events.LOAD_ME:
          this.handleLoadMeEvent(event, arg);
          break;
        case MemberController.Events.GET_ME:
          this.handleGetMeEvent(event, arg);
          break;
        case MemberController.Events.GET_MEMBER:
          this.handleGetMemberEvent(event, arg);
          break;
        default:
          throw new Error(
            MemberController.Error.UNKNOWN +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * process memberm events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMeEvent(event, arg, callback) {
    let urn =
      MemberController.Paths.MEMBER +
      MemberController.Paths.ME;

    this.doClientRequest(
      MemberController.Contexts.MEMBER_CLIENT,
      {},
      MemberController.Names.GET_ME,
      MemberController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadMeCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our callback for our gridtime request of loading ourselves
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMeCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let me = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.MEMBER
        ),
        collection = database.getCollection(
          MemberDatabase.Collections.ME
        ),
        view = database.getViewForMe();

      if (me) {
        this.batchRemoveFromViewInCollection(
          view,
          collection
        );
        collection.insert(me);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets ourselves that is stored in the database, or fetch from
   * gridtime server.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMeEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.MEMBER
    );

    arg.data = this.getMemberMe();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * get a member by username from the local DB, doesnt fallback to gridtime
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMemberEvent(event, arg, callback) {
    let username = arg.args.username;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.MEMBER
    );

    if (username === "me") {
      username = this.getMemberMe().username;
    }

    arg.data = database.getMemberByUsername(username);

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * this is a helper function which uses our client event bus to
   * give the client a reference of our new member me dto that is us.
   * @param me
   */
  updateMeInClient(me) {
    this.memberClientEventNotifier.dispatch(
      new ControllerEvent(
        MemberController.Events.UPDATE_ME,
        me
      )
    );
  }
}

module.exports = MemberController;
