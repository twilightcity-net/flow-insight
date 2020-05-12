const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds new team databases that stores team member information in
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
   * @returns {{MEMBERS: string}}
   * @constructor
   */
  static get Collections() {
    return {
      ME: "me"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{MEMBERS: string}}
   * @constructor
   */
  static get Views() {
    return {
      ME: "me"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{FULL_NAME: string, ID: string, USER_NAME: string, EMAIL: string, DISPLAY_NAME: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      EMAIL: "email",
      FULL_NAME: "fullName",
      DISPLAY_NAME: "displayName",
      USER_NAME: "username"
    };
  }

  /**
   * builds our members database from lokijs instance
   */
  constructor() {
    super(MemberDatabase.Name);
    this.name = "[DB.MemberDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(MemberDatabase.Collections.ME, {
      indices: [
        MemberDatabase.Indices.ID,
        MemberDatabase.Indices.USER_NAME,
        MemberDatabase.Indices.EMAIL,
        MemberDatabase.Indices.DISPLAY_NAME,
        MemberDatabase.Indices.FULL_NAME
      ]
    });
    this.getCollection(
      MemberDatabase.Collections.ME
    ).addDynamicView(MemberDatabase.Views.ME);
  }

  /**
   * gets my current status for all members
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
};
