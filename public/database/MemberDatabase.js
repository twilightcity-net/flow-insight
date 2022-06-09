const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

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
      MEMBERS: "members",
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
      MEMBERS: "members",
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
      FULL_NAME: "fullName",
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
      me = this.getMeFromView();

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

    DatabaseUtil.log("update xp summary", memberId);
  }

  /**
   * removes a given circuit from our members collection
   * @param circuit
   */
  removeActiveCircuitFromMembers(circuit) {
    DatabaseUtil.log(
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

    let me = this.getMeFromView(),
      activeCircuit = me.activeCircuit;

    if (activeCircuit && activeCircuit.id === circuit.id) {
      me.activeCircuit = null;
    }
  }

  /**
   * gets the object that represents our own user account from our db view
   * @returns {*}
   */
  getMeFromView() {
    return this.getViewForMe().data()[0];
  }

  /**
   * helper function used by our managers to update our selves
   * @param member
   */
  updateMemberMe(member) {
    let me = this.getMeFromView();
    if (me.id === member.id) {
      let collection = this.getCollection(
        MemberDatabase.Collections.ME
      );

      let batch = this.getViewForMe().data(),
        doc = Object.assign({}, member);

      collection.removeBatch(batch);
      collection.insert(doc);

      global.App.MemberManager.updateMe(member);
    }
  }

  /**
   * helper function used to determine if the id passed in is our own
   * @param memberId
   */
  isMe(memberId) {
    let me = this.getMeFromView();
    if (me.id === memberId) {
      return true;
    }
    return false;
  }
  /**
   * updates a member dto in our database and checks  to see if we should update our me
   * collection too.
   * @param member
   */
  updateMemberInMembers(member) {
    let collection = this.getCollection(
      MemberDatabase.Collections.MEMBERS
    );

    let model = collection.find({ id: member.id });
    if (model) {
      collection.remove(model);
    }
    collection.insert(Object.assign({}, member));
    this.updateMemberMe(member);

    DatabaseUtil.log("update member in members", member.id);
  }

  isMemberMe(member) {
    let me = this.getMeFromView();
    if (me.id === member.id) {
      return true;
    }
    return false;
  }

  getMemberByUsername(username) {
    let collection = this.getCollection(
      MemberDatabase.Collections.MEMBERS
    );

    let model = collection.find({ username: username });

    if (model.length > 0) {
      return model[0];
    } else {
      return null;
    }
  }

  getMemberById(memberId) {
    let collection = this.getCollection(
      MemberDatabase.Collections.MEMBERS
    );

    let member = collection.findOne({ id: memberId });

    return member;
  }
};
