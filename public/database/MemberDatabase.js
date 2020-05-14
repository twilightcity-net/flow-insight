const LokiJS = require("lokijs"),
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
   * @returns {{ME: string}}
   * @constructor
   */
  static get Collections() {
    return {
      ME: "me"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{ME: string}}
   * @constructor
   */
  static get Views() {
    return {
      ME: "me"
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
    this.name = "[DB.MemberDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(MemberDatabase.Collections.ME);
    this.getCollection(
      MemberDatabase.Collections.ME
    ).addDynamicView(MemberDatabase.Views.ME);
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
};
