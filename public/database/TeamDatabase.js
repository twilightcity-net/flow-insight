const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new team databases that stores team member informaton in
 * @type {TeamDatabase}
 */
module.exports = class TeamDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "team";
  }

  /**
   * the collections of our database
   * @returns {{MEMBERS: string, TEAMS: string, ME: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TEAMS: "teams",
      MEMBERS: "members",
      ME: "me"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{MEMBERS: string, TEAMS: string, ME: string, PRIMARY: string}}
   * @constructor
   */
  static get Views() {
    return {
      TEAMS: "teams",
      PRIMARY: "primary",
      MEMBERS: "members",
      ME: "me"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{ORG_ID: string, ID: string, USER_NAME: string, EMAIL: string, TYPE: string, DISPLAY_NAME: string, NAME: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      ORG_ID: "organizationId",
      NAME: "name",
      TYPE: "type",
      USER_NAME: "userName",
      EMAIL: "email",
      DISPLAY_NAME: "displayName"
    };
  }

  /**
   * builds our team database from lokijs instance
   */
  constructor() {
    super(TeamDatabase.Name);
    this.name = "[DB." + TeamDatabase.Name + "]";
    this.guid = Util.getGuid();
    this.addCollection(TeamDatabase.Collections.TEAMS, {
      indices: [
        TeamDatabase.Indices.ID,
        TeamDatabase.Indices.ORG_ID,
        TeamDatabase.Indices.NAME,
        TeamDatabase.Indices.TYPE
      ]
    });
    this.addCollection(TeamDatabase.Collections.MEMBERS, {
      indices: [
        TeamDatabase.Indices.ID,
        TeamDatabase.Indices.USER_NAME,
        TeamDatabase.Indices.EMAIL,
        TeamDatabase.Indices.DISPLAY_NAME
      ]
    });
    this.addCollection(TeamDatabase.Collections.ME);
    this.getCollection(TeamDatabase.Collections.TEAMS).addDynamicView(
      TeamDatabase.Views.TEAMS
    );
    this.getCollection(TeamDatabase.Collections.TEAMS).addDynamicView(
      TeamDatabase.Views.PRIMARY
    );
    this.getCollection(TeamDatabase.Collections.MEMBERS).addDynamicView(
      TeamDatabase.Views.MEMBERS
    );
    this.getCollection(TeamDatabase.Collections.ME).addDynamicView(
      TeamDatabase.Views.ME
    );
  }

  /**
   * gets our view for all of our teams
   * @returns {DynamicView}
   */
  getViewForTeams() {
    let collection = this.getCollection(TeamDatabase.Collections.TEAMS);
    return collection.getDynamicView(TeamDatabase.Views.TEAMS);
  }

  /**
   * returns our primary team we are part of from the local database
   * @returns {DynamicView}
   */
  getViewForMyPrimaryTeam() {
    let collection = this.getCollection(TeamDatabase.Collections.TEAMS),
      view = collection.getDynamicView(TeamDatabase.Views.PRIMARY);
    view.applyWhere(obj => {
      return obj.type === TeamDatabase.Collections.PRIMARY;
    });
    return view;
  }

  /**
   * returns the view for my status and all of my team members statuses
   * @returns {DynamicView}
   */
  getViewForStatusOfMeAndMyTeam() {
    let collection = this.getCollection(TeamDatabase.Collections.MEMBERS);
    return collection.getDynamicView(TeamDatabase.Views.MEMBERS);
  }

  /**
   * gets my current status for me
   * @returns {DynamicView}
   */
  getViewForMyCurrentStatus() {
    let collection = this.getCollection(TeamDatabase.Collections.ME);
    return collection.getDynamicView(TeamDatabase.Views.ME);
  }
};
