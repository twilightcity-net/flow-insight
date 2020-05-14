const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new team databases that stores team member informaton in
 * @type {MemberDatabase}
 */
module.exports = class MemberDatabase extends LokiJS {
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
    super(MemberDatabase.Name);
    this.name = "[DB.MemberDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(MemberDatabase.Collections.TEAMS, {
      indices: [
        MemberDatabase.Indices.ID,
        MemberDatabase.Indices.ORG_ID,
        MemberDatabase.Indices.NAME,
        MemberDatabase.Indices.TYPE
      ]
    });
    this.addCollection(MemberDatabase.Collections.MEMBERS, {
      indices: [
        MemberDatabase.Indices.ID,
        MemberDatabase.Indices.USER_NAME,
        MemberDatabase.Indices.EMAIL,
        MemberDatabase.Indices.DISPLAY_NAME
      ]
    });
    this.addCollection(MemberDatabase.Collections.ME);
    this.getCollection(
      MemberDatabase.Collections.TEAMS
    ).addDynamicView(MemberDatabase.Views.TEAMS);
    this.getCollection(
      MemberDatabase.Collections.MEMBERS
    ).addDynamicView(MemberDatabase.Views.MEMBERS);
    this.getCollection(
      MemberDatabase.Collections.ME
    ).addDynamicView(MemberDatabase.Views.ME);
  }

  /**
   * gets our view for all of our teams
   * @returns {DynamicView}
   */
  getViewForTeams() {
    let collection = this.getCollection(
      MemberDatabase.Collections.TEAMS
    );
    return collection.getDynamicView(
      MemberDatabase.Views.TEAMS
    );
  }

  /**
   * returns the view for my status and all of my team members statuses
   * @returns {DynamicView}
   */
  getViewForStatusOfMeAndMyTeam() {
    let collection = this.getCollection(
      MemberDatabase.Collections.MEMBERS
    );
    return collection.getDynamicView(
      MemberDatabase.Views.MEMBERS
    );
  }

  /**
   * gets my current status for me
   * @returns {DynamicView}
   */
  getViewForMyCurrentStatus() {
    let collection = this.getCollection(
      MemberDatabase.Collections.ME
    );
    return collection.getDynamicView(
      MemberDatabase.Views.ME
    );
  }
};
