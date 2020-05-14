const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  TeamDatabase = require("../database/TeamDatabase");

/**
 * This class is used to coordinate controllers across the member service
 * @type {MemberController}
 */
module.exports = class MemberController extends BaseController {
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
   * @returns {{LOAD_ME: string, GET_ME: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_ME: "load-me",
      GET_ME: "get-me"
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
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(MemberController.instance);
    this.memberClientEventListener = EventFactory.createEvent(
      EventFactory.Types.MEMBER_CLIENT,
      this,
      this.onMemberClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
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
   * process team events for the listener. returns dto to callback.
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
      store =>
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
   * team member dto from the server.
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMeCallback(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let me = store.data;

      // database = DatabaseFactory.getDatabase(
      //   DatabaseFactory.Names.TEAM
      // ),
      // collection = database.getCollection(
      //   TeamDatabase.Collections.TEAMS
      // );

      if (me) {
        console.log("me", me);

        // let results = collection.find({ isHomeTeam: true });
        // results.forEach(t => {
        //   t.isHomeTeam = false;
        //   collection.update(t);
        // });
        //
        // let result = collection.findOne({ id: team.id });
        // if (result) {
        //   collection.remove(result);
        // }
        //
        // member.isHomeTeam = true; //TEMP
        // collection.insert(team);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets one of our teams that is stored in the database, or fetch from
   * gridtime server.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMeEvent(event, arg, callback) {
    // let database = DatabaseFactory.getDatabase(
    //     DatabaseFactory.Names.TEAM
    //   ),
    //   collection = database.getCollection(
    //     TeamDatabase.Collections.TEAMS
    //   );
    //
    // arg.data = collection.findOne({ isHomeTeam: true });

    /// Temp
    arg.data = {
      id: "test",
      email: "noone@nowhere.com",
      fullName: "jane doe",
      displayName: "jane",
      username: "jane",
      onlineStatus: "online",
      xpSummary: "0"
    };

    console.log("temp", arg.data);

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
