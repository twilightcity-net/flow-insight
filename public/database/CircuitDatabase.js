const log = require("electron-log"),
  chalk = require("chalk"),
  LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

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
   * @returns {{CIRCUITS: string, LATER: string, CIRCUIT_MEMBERS: string, PARTICIPATING: string, ACTIVE: string, TEAM_CIRCUITS: string, RETRO: string}}
   * @constructor
   */
  static get Collections() {
    return {
      CIRCUITS: "circuits",
      PARTICIPATING: "participating",
      LATER: "later",
      RETRO: "retro",
      ACTIVE: "active",
      TEAM_CIRCUITS: "team-circuits",
      CIRCUIT_MEMBERS: "circuit-members"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{CIRCUITS: string, LATER: string, CIRCUIT_MEMBERS: string, PARTICIPATING: string, ACTIVE: string, TEAM_CIRCUITS: string, RETRO: string}}
   * @constructor
   */
  static get Views() {
    return {
      CIRCUITS: "circuits",
      PARTICIPATING: "participating",
      LATER: "later",
      RETRO: "retro",
      ACTIVE: "active",
      TEAM_CIRCUITS: "team-circuits",
      CIRCUIT_MEMBERS: "circuit-members"
    };
  }

  /**
   * Indices of our database. This allows us to index things for fast queries
   * @returns {{CIRCUIT_NAME: string, OPEN_TIME: string, CIRCUIT_STATE: string, DISPLAY_NAME: string, OWNER_ID: string, ORGANIZATION_ID: string, TEAM_NAME: string, OWNER_NAME: string, MODERATOR_ID: string, CLOSE_TIME: string, FULL_NAME: string, MEMBER_ID: string, USERNAME: string, ID: string, TEAM_ID: string, MODERATOR_NAME: string}}
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
      MODERATOR_NAME: "moderatorName",
      MEMBER_ID: "memberId",
      FULL_NAME: "fullName",
      DISPLAY_NAME: "displayName",
      USERNAME: "username"
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
    this.addCollection(CircuitDatabase.Collections.RETRO, {
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
      CircuitDatabase.Collections.RETRO
    ).addDynamicView(CircuitDatabase.Views.RETRO);
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
   * gets our view for our circuits that are on waiting to be
   * reviewed for retro.
   * @returns {DynamicView}
   */
  getViewAllMyRetroCircuits() {
    let collection = this.getCollection(
      CircuitDatabase.Collections.RETRO
    );
    return collection.getDynamicView(
      CircuitDatabase.Views.RETRO
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
  createNewCircuit(circuit) {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );

    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "insert new circuit state->" + circuit.circuitState,
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "insert 'participating' circuit",
      circuit.id
    );

    DatabaseUtil.log(
      "created new circuit [count=" +
        this.getViewCircuits().count() +
        "]",
      circuit.id
    );
  }

  /**
   * joins the active circuit, and sets the active circuit to this one.
   * @param circuit
   */
  joinActiveCircuit(circuit) {
    this.createNewCircuit(circuit);
    this.setActiveCircuit(circuit);
    DatabaseUtil.log("joined active circuit", circuit.id);
  }

  /**
   *
   * @param circuit
   */
  leaveActiveCircuit(circuit) {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );

    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log("remove circuit", circuit.id);

    collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log(
      "remove from participating circuits",
      circuit.id
    );

    this.removeActiveCircuit();
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

    DatabaseUtil.log(
      "remove circuit",
      this.getViewCircuits().count()
    );
  }

  /**
   * updates our circuit with a new on_hold status one. This updates,
   * removes and inserts into the later collection.
   * @param circuit
   * @param me
   */
  updateCircuitToDoItLater(circuit, me) {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );

    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "update circuit status -> ON_HOLD",
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log(
      "remove from participating circuits",
      circuit.id
    );

    this.removeActiveCircuit();

    if (Util.isCircuitOwnerModerator(me, circuit)) {
      collection = this.getCollection(
        CircuitDatabase.Collections.LATER
      );
      DatabaseUtil.findUpdateInsert(circuit, collection);
      DatabaseUtil.log("add to later circuits", circuit.id);
    }
  }

  /**
   * updates our circuit from on_hold status to resume. This needs to
   * update the circuits collection and add to our participating and active.
   * If the requester's id (memberId) is equal to our id then we originated it.
   * @param circuit
   * @param me
   * @param memberId
   */
  updateCircuitForResume(circuit, me, memberId) {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );

    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "update circuit status -> RESUME",
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.LATER
    );
    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log(
      "remove from later circuits",
      circuit.id
    );

    if (
      me.id === (circuit.ownerId || circuit.moderatorId)
    ) {
      collection = this.getCollection(
        CircuitDatabase.Collections.PARTICIPATING
      );
      DatabaseUtil.findUpdateInsert(circuit, collection);
      DatabaseUtil.log(
        "add to participating circuits",
        circuit.id
      );

      if (me.id === memberId) {
        this.setActiveCircuit(circuit);
      }
    }
  }

    /**
     * updates our circuit with a new description. This updates,
     * removes and inserts into the later collection.
     * @param circuit
     * @param me
     */
    updateCircuitForDescription(circuit, me) {
        let collection = this.getCollection(
            CircuitDatabase.Collections.CIRCUITS
        );

        DatabaseUtil.findUpdate(circuit, collection);
        DatabaseUtil.log(
            "update circuit description -> "+circuit.description,
            circuit.id
        );

        collection = this.getCollection(
            CircuitDatabase.Collections.PARTICIPATING
        );
        DatabaseUtil.findUpdate(circuit, collection);
        DatabaseUtil.log(
            "update description for participating circuits",
            circuit.id
        );

        if (Util.isCircuitOwnerModerator(me, circuit)) {
            collection = this.getCollection(
                CircuitDatabase.Collections.LATER
            );
            DatabaseUtil.findUpdate(circuit, collection);
            DatabaseUtil.log("update description for later circuits", circuit.id);
        }
    }

  /**
   * solves a given active circuit which is a wtf.
   * @param circuit
   */
  solveActiveCircuit(circuit) {
    let collection = this.getCollection(
      CircuitDatabase.Collections.CIRCUITS
    );

    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "update circuits -> SOLVED",
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.RETRO
    );

    DatabaseUtil.findUpdateInsert(circuit, collection);
    DatabaseUtil.log(
      "insert circuit -> SOLVED",
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.ACTIVE
    );
    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log(
      "remove from active circuits",
      circuit.id
    );

    collection = this.getCollection(
      CircuitDatabase.Collections.PARTICIPATING
    );
    DatabaseUtil.findRemove(circuit, collection);
    DatabaseUtil.log(
      "remove from participating circuits",
      circuit.id
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
   * saves our circuit as the active circuit, This is used by the
   * renderer process.
   * @param circuit
   */
  setActiveCircuit(circuit) {
    let collection = this.getCollection(
        CircuitDatabase.Collections.ACTIVE
      ),
      batch = this.getViewActiveCircuit().data(),
      doc = Object.assign({}, circuit);

    collection.removeBatch(batch);
    collection.insert(doc);

    DatabaseUtil.log("set active circuit", circuit.id);
  }

  /**
   * removes any or all active circuits stored in our collection. There
   * really should only ever be one.
   */
  removeActiveCircuit() {
    let collection = this.getCollection(
        CircuitDatabase.Collections.ACTIVE
      ),
      view = this.getViewActiveCircuit();

    collection.removeBatch(view.data());
    DatabaseUtil.log("remove active circuit", 1);
  }

  /**
   * creates a new collection for circuit members. This is updated through
   * gui requests and incoming talk messages. Each circuit will have its own
   * collection in the format of,
   * @returns {Collection}
   * @param name
   * @param view
   */
  addCircuitMembersCollection(name, view) {
    let indices = {
        indices: [
          CircuitDatabase.Indices.ID,
          CircuitDatabase.Indices.FULL_NAME,
          CircuitDatabase.Indices.DISPLAY_NAME,
          CircuitDatabase.Indices.USERNAME
        ]
      },
      collection = this.addCollection(name, indices);

    DatabaseUtil.log(
      "add circuit members collection",
      name
    );

    collection.addDynamicView(view);
    return collection;
  }

  /**
   * gets our name for our circuit members collection for our database's
   * collection for each of the circuits.
   * @param uri
   * @returns {string}
   */
  getCircuitMembersCollectionNameFromUri(uri) {
    return (
      CircuitDatabase.Collections.CIRCUIT_MEMBERS +
      "-" +
      uri
    );
  }

  /**
   * adds or returns and existing collection in our database
   * @returns {Collection}
   * @param uri
   */
  getCollectionForCircuitMembers(uri) {
    let name = this.getCircuitMembersCollectionNameFromUri(
        uri
      ),
      collection = this.getCollection(name),
      view = CircuitDatabase.Views.CIRCUIT_MEMBERS;

    if (!collection) {
      collection = this.addCircuitMembersCollection(
        name,
        view
      );
    }
    return collection;
  }

  /**
   * gets the view for a specific collection of circuit members. Each
   * collection has its own view.
   * @param collection
   * @returns {DynamicView}
   */
  getViewCircuitMembersForCollection(collection) {
    return collection.getDynamicView(
      CircuitDatabase.Views.CIRCUIT_MEMBERS
    );
  }

  /**
   * updates the collection of circuit members based on their associated
   * uri. This function will insert or update the members. When a member
   * leaves the room, then we should remove them from the collection.
   * @param uri
   * @param circuitMembers
   * @param collection
   * @param shouldRemove
   */
  updateCircuitMembersInCollection(
    uri,
    circuitMembers,
    collection,
    shouldRemove
  ) {
    for (
      let i = 0,
        len = circuitMembers.length,
        circuitMember = null;
      i < len;
      i++
    ) {
      circuitMember = circuitMembers[i];
      if (shouldRemove) {
        DatabaseUtil.findRemoveByMemberId(
          circuitMember,
          collection
        );
      } else {
        DatabaseUtil.findUpdateInsertByMemberId(
          circuitMember,
          collection
        );
      }
    }
    DatabaseUtil.log(
      shouldRemove
        ? "updated circuit members"
        : "removed circuit members",
      circuitMembers.length
    );
  }
};
