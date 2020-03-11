const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class builds a new databases
 * @type {CircuitDatabase}
 */
module.exports = class CircuitDatabase extends LokiJS {
  /**
   * the name of our database file
   * @returns {string}
   */
  static get Name() {
    return "circuit";
  }

  /**
   * the collections of our database
   * @returns {{LATER: string, PARTICIPATING: string, ACTIVE: string}}
   * @constructor
   */
  static get Collections() {
    return {
      PARTICIPATING: "participating",
      LATER: "later",
      ACTIVE: "active"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{LATER: string, PARTICIPATING: string, ACTIVE: string}}
   * @constructor
   */
  static get Views() {
    return {
      PARTICIPATING: "participating",
      LATER: "later",
      ACTIVE: "active"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{CIRCUIT_NAME: string, OPEN_TIME: string, CLOSE_TIME: string, ID: string, CIRCUIT_STATUS: string, OWNER_ID: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      CIRCUIT_NAME: "circuitName",
      OWNER_ID: "ownerId",
      OPEN_TIME: "openTIme",
      CLOSE_TIME: "closeTime",
      CIRCUIT_STATUS: "circuit-status"
    };
  }

  /**
   * builds our database class
   */
  constructor() {
    super(CircuitDatabase.Name);
    this.name = "[DB.CircuitDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(CircuitDatabase.Collections.PARTICIPATING, {
      indices: [
        CircuitDatabase.Indices.ID,
        CircuitDatabase.Indices.CIRCUIT_NAME,
        CircuitDatabase.Indices.OWNER_ID,
        CircuitDatabase.Indices.OPEN_TIME,
        CircuitDatabase.Indices.CLOSE_TIME,
        CircuitDatabase.Indices.CIRCUIT_STATUS
      ]
    });
    this.addCollection(CircuitDatabase.Collections.LATER, {
      indices: [
        CircuitDatabase.Indices.ID,
        CircuitDatabase.Indices.CIRCUIT_NAME,
        CircuitDatabase.Indices.OWNER_ID,
        CircuitDatabase.Indices.OPEN_TIME,
        CircuitDatabase.Indices.CLOSE_TIME,
        CircuitDatabase.Indices.CIRCUIT_STATUS
      ]
    });
    this.addCollection(CircuitDatabase.Collections.ACTIVE, {
      indices: [
        CircuitDatabase.Indices.ID,
        CircuitDatabase.Indices.CIRCUIT_NAME,
        CircuitDatabase.Indices.OWNER_ID,
        CircuitDatabase.Indices.OPEN_TIME,
        CircuitDatabase.Indices.CLOSE_TIME,
        CircuitDatabase.Indices.CIRCUIT_STATUS
      ]
    });
    this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    ).addDynamicView(CircuitDatabase.Views.PARTICIPATING);
    this.getCollection(CircuitDatabase.Collections.LATER).addDynamicView(
      CircuitDatabase.Views.LATER
    );
    this.getCollection(CircuitDatabase.Collections.ACTIVE).addDynamicView(
      CircuitDatabase.Views.ACTIVE
    );
  }

  /**
   * gets our view for our currently joined circuits on our team
   * @returns {DynamicView}
   */
  getViewAllMyParticipatingCircuits() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    return collection.getDynamicView(CircuitDatabase.Views.PARTICIPATING);
  }

  /**
   * gets our view for our circuits that are on hold
   * @returns {DynamicView}
   */
  getViewAllMyDoItLaterCircuits() {
    let collection = this.getCollection(CircuitDatabase.Collections.LATER);
    return collection.getDynamicView(CircuitDatabase.Views.LATER);
  }

  /**
   * gets our current view for our active circuit
   * @returns {DynamicView}
   */
  getViewActiveCircuit() {
    let collection = this.getCollection(CircuitDatabase.Collections.ACTIVE);
    return collection.getDynamicView(CircuitDatabase.Views.ACTIVE);
  }
};
