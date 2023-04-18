const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  TeamDatabase = require("../database/TeamDatabase"),
  MemberDatabase = require("../database/MemberDatabase");

/**
 * This class is used to coordinate controllers across the journal service
 * @type {TeamController}
 */
module.exports = class TeamController extends (
  BaseController
) {
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
   * @returns {{GET_ACTIVE_ORG:string, GET_MY_HOME_TEAM: string, GET_ALL_MY_TEAMS: string, LOAD_MY_HOME_TEAM: string, LOAD_ALL_MY_TEAMS: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_MY_HOME_TEAM: "load-my-home-team",
      LOAD_ALL_MY_TEAMS: "load-all-my-teams",
      GET_MY_HOME_TEAM: "get-my-home-team",
      GET_ALL_MY_TEAMS: "get-all-my-teams",
      GET_ACTIVE_ORG: "get-active-org",
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
        case TeamController.Events.GET_MY_HOME_TEAM:
          this.handleGetMyHomeTeamEvent(event, arg);
          break;
        case TeamController.Events.GET_ALL_MY_TEAMS:
          this.handleGetAllMyTeamsEvent(event, arg);
          break;
        case TeamController.Events.GET_ACTIVE_ORG:
          this.handleGetActiveOrgEvent(event, arg);
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
      (store) =>
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
        this.resetHomeTeamFlag(team, collection);
        let result = collection.findOne({ id: team.id });
        if (result) {
          collection.remove(result);
        }
        collection.insert(team);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * resets the isHomeTeam flag on any document collection
   * @param doc
   * @param collection
   * @deprecated
   */
  resetHomeTeamFlag(doc, collection) {
    let results = collection.find({ isHomeTeam: true });
    results.forEach((t) => {
      t.isHomeTeam = false;
      collection.update(t);
    });
  }

  /**
   * gets all of our participating teams we have loaded from  the db. If the collections are
   * empty, we will try looking for new content on grid.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadAllMyTeamsEvent(event, arg, callback) {
    let urn = TeamController.Paths.TEAM;

    this.doClientRequest(
      TeamController.Contexts.TEAM_CLIENT,
      {},
      TeamController.Names.GET_ALL_MY_TEAMS,
      TeamController.Types.GET,
      urn,
      (store) =>
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
      arg.data = store.data;

      let teams = store.data,
        teamDatabase = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.TEAM
        ),
        memberDatabase = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.MEMBER
        ),
        teamsCollection = teamDatabase.getCollection(
          TeamDatabase.Collections.TEAMS
        ),
        membersCollection = memberDatabase.getCollection(
          MemberDatabase.Collections.MEMBERS
        );

      if (teams && teams.length > 0) {
        teams.forEach((t) => {
          let teamMembers = t.teamMembers;
          for (let i = 0; i < teamMembers.length; i++) {
            this.findRemoveXInsertDoc(
              null,
              membersCollection,
              teamMembers[i]
            );
          }

          let team = teamsCollection.findOne({ id: t.id });
          if (team) {
            teamsCollection.remove(team);
          }
          teamsCollection.insert(t);
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

    arg.data = collection.findOne({ homeTeam: true });

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

    if (view.count() === 0) {
      this.logMessage(
        this.name,
        "No rows found for teams!"
      );

      this.handleLoadAllMyTeamsEvent({}, {}, (args) => {
        if (args.data) {
          arg.data = args.data;
        }
        if (args.error) {
          arg.error = args.error;
        }

        this.delegateCallbackOrEventReplyTo(
          event,
          arg,
          callback
        );
      });

      //okay this is true here, so I should be able to do the fallback
    } else {
      this.delegateCallbackWithView(null, view, event, arg);
    }
  }

  /**
   * gets the org information from the active connection status
   * @param event
   * @param arg
   * @param callback
   */
  handleGetActiveOrgEvent(event, arg, callback) {
    let connectionStatus = global.App.connectionStatus;

    let org = {
      orgId: connectionStatus.orgId,
      orgName: connectionStatus.orgName,
      orgDomainName: connectionStatus.orgDomainName,
    };

    arg.data = org;

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
