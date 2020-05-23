const log = require("electron-log"),
  chalk = require("chalk"),
  LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new member databases that stores  member information in
 * @type {MemberDatabase}
 */
module.exports = class MemberDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "member";
  }

  /**
   * the collections of our database
   * @returns {{MEMBERS: string, ME: string}}
   * @constructor
   */
  static get Collections() {
    return {
      ME: "me",
      MEMBERS: "members"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{MEMBERS: string, ME: string}}
   * @constructor
   */
  static get Views() {
    return {
      ME: "me",
      MEMBERS: "members"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{FULL_NAME: string, ID: string, USER_NAME: string, EMAIL: string, DISPLAY_NAME: string, NAME: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      NAME: "name",
      USER_NAME: "username",
      EMAIL: "email",
      DISPLAY_NAME: "displayName",
      FULL_NAME: "fullName"
    };
  }

  /**
   * builds our member database from lokijs instance
   */
  constructor() {
    super(MemberDatabase.Name);
    this.name = "[MemberDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(MemberDatabase.Collections.ME);
    this.addCollection(MemberDatabase.Collections.MEMBERS);
    this.getCollection(
      MemberDatabase.Collections.ME
    ).addDynamicView(MemberDatabase.Views.ME);
    this.getCollection(
      MemberDatabase.Collections.MEMBERS
    ).addDynamicView(MemberDatabase.Views.MEMBERS);
  }

  /**
   * gets my current status for me
   * @returns {DynamicView}
   */
  getViewForMe() {
    let collection = this.getCollection(
      MemberDatabase.Collections.ME
    );
    return collection.getDynamicView(
      MemberDatabase.Views.ME
    );
  }

  /**
   * gets our members we know about from all teams
   * @returns {DynamicView}
   */
  getViewForMembers() {
    let collection = this.getCollection(
      MemberDatabase.Collections.MEMBERS
    );
    return collection.getDynamicView(
      MemberDatabase.Views.MEMBERS
    );
  }

  /**
   * updates our xp summary with a new one via our talk controller
   * or other by any means necessary. just ask rambo.
   * @param data
   */
  updateXPStatusByTeamMemberId(data) {
    let collection = this.getCollection(
        MemberDatabase.Collections.MEMBERS
      ),
      memberId = data.memberId,
      member = collection.findOne({ id: memberId }),
      newXPSummary = data.newXPSummary,
      me = this.getMe();

    if (member && newXPSummary) {
      member.xpSummary = newXPSummary;
      if (me && me.id === memberId) {
        me.xpSummary = newXPSummary;
      }
    } else {
      console.warn(
        "Unable to update member xp status",
        member,
        newXPSummary
      );
    }

    this.log("update xp summary", memberId);
  }

  /**
   * removes a given circuit from our members collection
   * @param circuit
   */
  removeActiveCircuitFromMembers(circuit) {
    this.log(
      "remove active circuit -> " + circuit.circuitName,
      circuit.id
    );

    let members = this.getViewForMembers().data();
    for (let i = 0, member, c; i < members.length; i++) {
      member = members[i];
      c = member.activeCircuit;
      if (c && c.id === circuit.id) {
        member.activeCircuit = null;
      }
    }

    let me = this.getMe(),
      activeCircuit = me.activeCircuit;

    if (activeCircuit && activeCircuit.id === circuit.id) {
      me.activeCircuit = null;
    }
  }

  /**
   * gets our user object of ourselves logged in.
   * @returns {Array}
   */
  getMe() {
    let view = this.getViewForMe();
    return view.data()[0];
  }

  /**
   * logs a database message with a fancy blue color
   * @param message
   * @param count
   */
  log(message, count) {
    log.info(
      chalk.blueBright(this.name) +
        " " +
        message +
        " : {" +
        count +
        "}"
    );
  }
};
