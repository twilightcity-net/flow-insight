const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  MemberWorkStatusDto = require("../dto/MemberWorkStatusDto"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  TeamDatabase = require("../database/TeamDatabase");

/**
 * This class is used to coordinate controllers across the journal service
 * @type {TeamController}
 */
module.exports = class TeamController extends BaseController {
  /**
   * builds our Journal Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TeamController);
    if (!TeamController.instance) {
      TeamController.instance = this;
      TeamController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_STATUS_OF_ME_AND_MY_TEAM: string, LOAD_ALL_MY_TEAMS: string, LOAD_MY_CURRENT_STATUS: string, GET_MY_HOME_TEAM: string, GET_ALL_MY_TEAMS: string, GET_MY_CURRENT_STATUS: string, LOAD_MY_HOME_TEAM: string, LOAD_STATUS_OF_ME_AND_MY_TEAM: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_HOME_TEAM: "load-my-home-team",
      LOAD_ALL_MY_TEAMS: "load-all-my-teams",
      GET_MY_HOME_TEAM: "get-my-home-team",
      GET_ALL_MY_TEAMS: "get-all-my-teams",
      LOAD_MY_CURRENT_STATUS: "load-my-current-status",
      LOAD_STATUS_OF_ME_AND_MY_TEAM:
        "load-status-of-me-and-my-team",
      GET_MY_CURRENT_STATUS: "get-my-current-status",
      GET_STATUS_OF_ME_AND_MY_TEAM:
        "get-status-of-me-and-my-team"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      TeamController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TeamController.instance);
    this.teamClientEventListener = EventFactory.createEvent(
      EventFactory.Types.TEAM_CLIENT,
      this,
      this.onTeamClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onTeamClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        TeamController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case TeamController.Events.LOAD_MY_HOME_TEAM:
          this.handleLoadMyHomeTeamEvent(event, arg);
          break;
        case TeamController.Events.LOAD_ALL_MY_TEAMS:
          this.handleLoadAllMyTeamsEvent(event, arg);
          break;
        case TeamController.Events.LOAD_MY_CURRENT_STATUS:
          this.handleLoadMyCurrentStatus(event, arg);
          break;
        case TeamController.Events
          .LOAD_STATUS_OF_ME_AND_MY_TEAM:
          this.handleLoadStatusOfMeAndMyTeam(event, arg);
          break;
        case TeamController.Events.GET_MY_HOME_TEAM:
          this.handleGetMyHomeTeamEvent(event, arg);
          break;
        case TeamController.Events.GET_ALL_MY_TEAMS:
          this.handleGetAllMyTeamsEvent(event, arg);
          break;
        case TeamController.Events.GET_MY_CURRENT_STATUS:
          this.handleGetMyCurrentStatusEvent(event, arg);
          break;
        case TeamController.Events
          .GET_STATUS_OF_ME_AND_MY_TEAM:
          this.handleGetStatusOfMeAndMyTeamEvent(
            event,
            arg
          );
          break;
        default:
          throw new Error(
            TeamController.Error.UNKNOWN +
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
  handleLoadMyHomeTeamEvent(event, arg, callback) {
    let urn =
      TeamController.Paths.TEAM + TeamController.Paths.HOME;

    this.doClientRequest(
      TeamController.Contexts.TEAM_CLIENT,
      {},
      TeamController.Names.GET_MY_HOME_TEAM,
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadMyHomeTeamCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our callback for our gridtime request of loading my home
   * team dto from the server.s
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMyHomeTeamCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let team = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.TEAM
        ),
        collection = database.getCollection(
          TeamDatabase.Collections.TEAMS
        );

      if (team) {
        let results = collection.find({ isHomeTeam: true });
        results.forEach(t => {
          t.isHomeTeam = false;
          collection.update(t);
        });

        let result = collection.findOne({ id: team.id });
        if (result) {
          collection.remove(result);
        }

        team.isHomeTeam = true; //TEMP
        collection.insert(team);
      }
    }
  }

  /**
   * gets all of our participating teams we have loaded from  the db. If the collections are
   * empty, we will try looking for new content on grid.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyTeamsEvent(event, arg, callback) {
    let urn =
      TeamController.Paths.TEAM +
      TeamController.Paths.MY +
      TeamController.Paths.PARTICIPATING;

    this.doClientRequest(
      TeamController.Contexts.TEAM_CLIENT,
      {},
      TeamController.Names.GET_ALL_MY_TEAMS,
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadAllMyTeamsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our dto callback from our rest client
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadAllMyTeamsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let teams = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.TEAM
        ),
        collection = database.getCollection(
          TeamDatabase.Collections.TEAMS
        );

      if (teams && teams.length > 0) {
        teams.forEach(t => {
          let team = collection.findOne({ id: t.id });
          if (team) {
            collection.remove(team);
          }
          collection.insert(t);
        });
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets our current status of ourselves
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadMyCurrentStatus(event, arg, callback) {
    let urn =
      TeamController.Paths.STATUS +
      TeamController.Strings.ME;

    this.doClientRequest(
      TeamController.Contexts.TEAM_CLIENT,
      {},
      "getMyCurrentStatus",
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadMyCurrentStatusCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback processor for our current status query
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadMyCurrentStatusCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.TEAM
        ),
        collection = database.getCollection(
          TeamDatabase.Collections.ME
        ),
        view = database.getViewForMyCurrentStatus(),
        member = new MemberWorkStatusDto(store.data),
        me = view.data()[0];

      if (me) {
        me = member;
        collection.update(me);
      } else {
        collection.insert(member);
      }
    }
    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * loads our current status and our team status
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadStatusOfMeAndMyTeam(event, arg, callback) {
    let urn = TeamController.Paths.STATUS_TEAM;

    this.doClientRequest(
      TeamController.Contexts.TEAM_CLIENT,
      {},
      "getStatusOfMeAndMyTeam",
      TeamController.Types.GET,
      urn,
      store =>
        this.delegateLoadStatusOfMeAndMyTeamCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * processes our callback for when when load our team status
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadStatusOfMeAndMyTeamCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.TEAM
        ),
        collection = database.getCollection(
          TeamDatabase.Collections.MEMBERS
        ),
        view = database.getViewForStatusOfMeAndMyTeam();

      if (view.count() === 0) {
        store.data.forEach(m => {
          collection.insert(new MemberWorkStatusDto(m));
        });
      } else if (store.data.length > 0) {
        store.data.forEach(m => {
          let member = collection.findOne({ id: m.id });
          if (member) {
            member = new MemberWorkStatusDto(m);
            collection.update(member);
          } else {
            collection.insert(new MemberWorkStatusDto(m));
          }
        });
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
  handleGetMyHomeTeamEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TEAM
      ),
      collection = database.getCollection(
        TeamDatabase.Collections.TEAMS
      );

    arg.data = collection.findOne({ isHomeTeam: true });

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * gets all of our teams we are participating from our local database.
   * @param event
   * @param arg
   * @param callback
   */
  handleGetAllMyTeamsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TEAM
      ),
      view = database.getViewForTeams();

    this.delegateCallbackWithView(null, view, event, arg);
  }

  /**
   * queries for our current status in our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetMyCurrentStatusEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TEAM
      ),
      view = database.getViewForMyCurrentStatus();

    this.delegateCallbackWithView(null, view, event, arg);
  }

  /**
   * queries for our team status from our local database
   * @param event
   * @param arg
   * @param callback
   */
  handleGetStatusOfMeAndMyTeamEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TEAM
      ),
      view = database.getViewForStatusOfMeAndMyTeam();

    this.delegateCallbackWithView(null, view, event, arg);
  }
};
