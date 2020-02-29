const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new team databases that stores team member informaton in
 * @type {TeamDatabase}
 */
module.exports = class TeamDatabase extends LokiJS {
  static get Name() {
    return "team";
  }

  static get Collections() {
    return {
      TEAMS: "teams",
      MEMBERS: "members",
      ME: "me"
    };
  }

  static get Views() {
    return {
      TEAMS: "teams",
      PRIMARY: "primary",
      MEMBERS: "members",
      ME: "me"
    };
  }

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

  getViewForTeams() {
    let collection = this.getCollection(TeamDatabase.Collections.TEAMS);
    return collection.getDynamicView(TeamDatabase.Views.TEAMS);
  }

  getViewForMyPrimaryTeam() {
    let collection = this.getCollection(TeamDatabase.Collections.TEAMS),
      view = collection.getDynamicView(TeamDatabase.Views.PRIMARY);
    view.applyWhere(obj => {
      return obj.type === TeamDatabase.Collections.PRIMARY;
    });
    return view;
  }

  getViewForStatusOfMeAndMyTeam() {
    let collection = this.getCollection(TeamDatabase.Collections.MEMBERS);
    return collection.getDynamicView(TeamDatabase.Views.MEMBERS);
  }

  getViewForMyCurrentStatus() {
    let collection = this.getCollection(TeamDatabase.Collections.ME);
    return collection.getDynamicView(TeamDatabase.Views.ME);
  }
};
