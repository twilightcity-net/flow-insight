const log = require("electron-log"),
  chalk = require("chalk"),
  LokiJS = require("lokijs"),
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
   * @returns {{CIRCUITS: string, LATER: string, PARTICIPATING: string, ACTIVE: string, TEAM_CIRCUITS: string}}
   * @constructor
   */
  static get Collections() {
    return {
      CIRCUITS: "circuits",
      PARTICIPATING: "participating",
      LATER: "later",
      ACTIVE: "active",
      TEAM_CIRCUITS: "team-circuits"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{CIRCUITS: string, LATER: string, PARTICIPATING: string, ACTIVE: string, TEAM_CIRCUITS: string}}
   * @constructor
   */
  static get Views() {
    return {
      CIRCUITS: "circuits",
      PARTICIPATING: "participating",
      LATER: "later",
      ACTIVE: "active",
      TEAM_CIRCUITS: "team-circuits"
    };
  }

  /**
   * Indices of our database. This allows us to index things for fast queries
   * @returns {{TEAM_NAME: string, CIRCUIT_NAME: string, OPEN_TIME: string, OWNER_NAME: string, CIRCUIT_STATE: string, MODERATOR_ID: string, CLOSE_TIME: string, ID: string, OWNER_ID: string, ORGANIZATION_ID: string, TEAM_ID: string, MODERATOR_NAME: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      CIRCUIT_NAME: "circuitName",
      OWNER_ID: "ownerId",
      OWNER_NAME: "ownerName",
      OPEN_TIME: "openTime",
      CLOSE_TIME: "closeCircuitNanoTime",
      CIRCUIT_STATE: "circuitState",
      ORGANIZATION_ID: "organizationId",
      TEAM_ID: "teamId",
      TEAM_NAME: "teamName",
      MODERATOR_ID: "moderatorId",
      MODERATOR_NAME: "moderatorName"
    };
  }

  /**
   * builds our database class
   */
  constructor() {
    super(CircuitDatabase.Name);
    this.name = "[CircuitDatabase]";
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
    this.addCollection(
      CircuitDatabase.Collections.TEAM_CIRCUITS,
      {
        indices: [
          CircuitDatabase.Indices.ORGANIZATION_ID,
          CircuitDatabase.Indices.TEAM_ID,
          CircuitDatabase.Indices.TEAM_NAME,
          CircuitDatabase.Indices.OWNER_ID,
          CircuitDatabase.Indices.OWNER_NAME,
          CircuitDatabase.Indices.MODERATOR_ID,
          CircuitDatabase.Indices.MODERATOR_NAME
        ]
      }
    );
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
    this.getCollection(
      CircuitDatabase.Collections.TEAM_CIRCUITS
    ).addDynamicView(CircuitDatabase.Views.TEAM_CIRCUITS);
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

  /**
   * gets our current view for our team circuits
   * @returns {DynamicView}
   */
  getViewTeamCircuits() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.TEAM_CIRCUITS
    );
    return collection.getDynamicView(
      CircuitDatabase.Views.TEAM_CIRCUITS
    );
  }

  /**
   * updates a specific circuit in all of our possible circuit
   * collections within this database
   * @param circuit
   */
  insertCircuitOrUpdateCircuitState(circuit) {
    let collection = this.getCollection(
        CircuitDatabase.Collections.CIRCUITS
      ),
      result = collection.findOne({
        id: circuit.id
      });

    if (result) {
      result.circuitState = circuit.circuitState;
    } else {
      collection.insert(circuit);
    }

    collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    result = collection.findOne({
      id: circuit.id
    });
    if (result) {
      result.circuitState = circuit.circuitState;
    }

    collection = this.getCollection(
      CircuitDatabase.Collections.LATER
    );
    result = collection.findOne({
      id: circuit.id
    });
    if (result) {
      result.circuitState = circuit.circuitState;
    }

    this.log(
      "insert circuit",
      this.getViewCircuits().count()
    );
  }

  /**
   * removes a given circuit from all of our collections in our
   * database
   * @param circuit
   */
  removeCircuitFromAllCollections(circuit) {
    let id = circuit.id;
    this.removeCircuitByIdFromCollectionName(
      id,
      CircuitDatabase.Collections.CIRCUITS
    );
    this.removeCircuitByIdFromCollectionName(
      id,
      CircuitDatabase.Collections.PARTICIPATING
    );
    this.removeCircuitByIdFromCollectionName(
      id,
      CircuitDatabase.Collections.LATER
    );
    this.removeCircuitByIdFromCollectionName(
      id,
      CircuitDatabase.Collections.ACTIVE
    );

    this.log(
      "remove circuit",
      this.getViewCircuits().count()
    );
  }

  /**
   * finds and removes a circuit by id by a given name
   * of a circuit database collection
   * @param id
   * @param name
   */
  removeCircuitByIdFromCollectionName(id, name) {
    let collection = this.getCollection(name);
    collection.findAndRemove({ id: id });
  }

  /**
   * logs a database message with a fanyc blue color
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
