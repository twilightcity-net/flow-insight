const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new flow database that stores flow state information for team members
 * @type {FlowDatabase}
 */
module.exports = class FlowDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "flow";
  }

  /**
   * the collections of our database
   * @returns {{FLOW: string}}
   * @constructor
   */
  static get Collections() {
    return {
      FLOW: "flow",
    };
  }

  /**
   * the views of our database for queries
   * @returns {{FLOW: string}}
   * @constructor
   */
  static get Views() {
    return {
      FLOW: "flow",
    };
  }

  static myId = 1;

  /**
   * builds our dictionary database from lokijs instance
   */
  constructor() {
    super(FlowDatabase.Name);
    this.name = "[FlowDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(FlowDatabase.Collections.FLOW);
  }



  /**
   * Update my personal flow data in the DB
   * @param myFlowData
   */
  updateMyFlow(myFlowData) {
    let collection = this.getCollection(
      FlowDatabase.Collections.FLOW
    );

    let doc = {id: FlowDatabase.myId, momentum: myFlowData.momentum};
    DatabaseUtil.findRemoveInsert(doc, collection);
  }

  /**
   * Retrieve personal flow data in DB
   * @param myFlowData
   */
  getMyFlow() {
    let collection = this.getCollection(
      FlowDatabase.Collections.FLOW
    );

    return collection.findOne({id: FlowDatabase.myId});
  }

};
