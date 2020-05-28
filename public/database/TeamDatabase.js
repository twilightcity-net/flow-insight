const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

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
   * @returns {{TEAMS: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TEAMS: "teams"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{TEAMS: string}}
   * @constructor
   */
  static get Views() {
    return {
      TEAMS: "teams"
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
    this.name = "[TeamDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(TeamDatabase.Collections.TEAMS, {
      indices: [
        TeamDatabase.Indices.ID,
        TeamDatabase.Indices.ORG_ID,
        TeamDatabase.Indices.NAME,
        TeamDatabase.Indices.TYPE
      ]
    });
    this.getCollection(
      TeamDatabase.Collections.TEAMS
    ).addDynamicView(TeamDatabase.Views.TEAMS);
  }

  /**
   * gets our view for all of our teams
   * @returns {DynamicView}
   */
  getViewForTeams() {
    let collection = this.getCollection(
      TeamDatabase.Collections.TEAMS
    );
    return collection.getDynamicView(
      TeamDatabase.Views.TEAMS
    );
  }

  /**
   * updates our team member that is stored in our team members
   * array of in each of our teams. This function will iterate
   * over all of the teams in our database, and update the document
   * where found.
   * @param teamMember
   */
  updateTeamMemberInTeams(teamMember) {
    let view = this.getViewForTeams();
    for (
      let i = 0, j = 0, teams = view.data(), team;
      i < teams.length;
      i++
    ) {
      team = teams[i];
      for (j = 0; j < team.teamMembers.length; j++) {
        if (team.teamMembers[j].id === teamMember.id) {
          team.teamMembers[j] = teamMember;
          break;
        }
      }
    }

    DatabaseUtil.log("update team member", teamMember.id);
  }

  /**
   * updates the xp summary in the team member dto that is stored in the team
   * @param data
   */
  updateTeamMemberXPSummaryInTeams(data) {
    let view = this.getViewForTeams(),
      memberId = data.memberId,
      newXPSummary = data.newXPSummary;

    for (
      let i = 0, j = 0, teams = view.data(), team;
      i < teams.length;
      i++
    ) {
      team = teams[i];
      for (j = 0; j < team.teamMembers.length; j++) {
        if (team.teamMembers[j].id === memberId) {
          let teamMember = team.teamMembers[j];
          teamMember.xpSummary = newXPSummary;

          DatabaseUtil.log("update team member", memberId);
          break;
        }
      }
    }
  }
};
