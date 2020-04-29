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
      CIRCUITS: "circuits",
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
      CIRCUITS: "circuits",
      PARTICIPATING: "participating",
      LATER: "later",
      ACTIVE: "active"
    };
  }

  /**
   * Indices of our database. This allows us to index things for fast queries
   * @returns {{CIRCUIT_NAME: string, OPEN_TIME: string, CIRCUIT_STATE: string, CLOSE_TIME: string, ID: string, OWNER_ID: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      CIRCUIT_NAME: "circuitName",
      OWNER_ID: "ownerId",
      OPEN_TIME: "openTime",
      CLOSE_TIME: "closeCircuitNanoTime",
      CIRCUIT_STATE: "circuitState"
    };
  }

  /**
   * builds our database class
   */
  constructor() {
    super(CircuitDatabase.Name);
    this.name = "[DB.CircuitDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(
      CircuitDatabase.Collections.CIRCUITS,
      {
        indices: [
          CircuitDatabase.Indices.ID,
          CircuitDatabase.Indices.CIRCUIT_NAME,
          CircuitDatabase.Indices.OWNER_ID,
          CircuitDatabase.Indices.OPEN_TIME,
          CircuitDatabase.Indices.CLOSE_TIME,
          CircuitDatabase.Indices.CIRCUIT_STATE
        ]
      }
    );
    this.addCollection(
      CircuitDatabase.Collections.PARTICIPATING,
      {
        indices: [
          CircuitDatabase.Indices.ID,
          CircuitDatabase.Indices.CIRCUIT_NAME,
          CircuitDatabase.Indices.OWNER_ID,
          CircuitDatabase.Indices.OPEN_TIME,
          CircuitDatabase.Indices.CLOSE_TIME,
          CircuitDatabase.Indices.CIRCUIT_STATE
        ]
      }
    );
    this.addCollection(CircuitDatabase.Collections.LATER, {
      indices: [
        CircuitDatabase.Indices.ID,
        CircuitDatabase.Indices.CIRCUIT_NAME,
        CircuitDatabase.Indices.OWNER_ID,
        CircuitDatabase.Indices.OPEN_TIME,
        CircuitDatabase.Indices.CLOSE_TIME,
        CircuitDatabase.Indices.CIRCUIT_STATE
      ]
    });
    this.addCollection(CircuitDatabase.Collections.ACTIVE, {
      indices: [
        CircuitDatabase.Indices.ID,
        CircuitDatabase.Indices.CIRCUIT_NAME,
        CircuitDatabase.Indices.OWNER_ID,
        CircuitDatabase.Indices.OPEN_TIME,
        CircuitDatabase.Indices.CLOSE_TIME,
        CircuitDatabase.Indices.CIRCUIT_STATE
      ]
    });
    this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    ).addDynamicView(CircuitDatabase.Views.CIRCUITS);
    this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    ).addDynamicView(CircuitDatabase.Views.PARTICIPATING);
    this.getCollection(
      CircuitDatabase.Collections.LATER
    ).addDynamicView(CircuitDatabase.Views.LATER);
    this.getCollection(
      CircuitDatabase.Collections.ACTIVE
    ).addDynamicView(CircuitDatabase.Views.ACTIVE);
  }

  /**
   * gets our view for our known circuits on our team
   * @returns {DynamicView}
   */
  getViewCircuits() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );
    return collection.getDynamicView(
      CircuitDatabase.Views.CIRCUITS
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
    return collection.getDynamicView(
      CircuitDatabase.Views.PARTICIPATING
    );
  }

  /**
   * gets our view for our circuits that are on hold
   * @returns {DynamicView}
   */
  getViewAllMyDoItLaterCircuits() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.LATER
    );
    return collection.getDynamicView(
      CircuitDatabase.Views.LATER
    );
  }

  /**
   * gets our current view for our active circuit
   * @returns {DynamicView}
   */
  getViewActiveCircuit() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.ACTIVE
    );
    return collection.getDynamicView(
      CircuitDatabase.Views.ACTIVE
    );
  }
};
