const log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  { EventManager } = require("../events/EventManager"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * this is used to store a database of references to our in memory databases
 * @type {VolumeManager}
 */
class VolumeManager {
  /**
   * global static array we store our database volumes in
   * @returns {map}
   */
  static get Volumes() {
    return VolumeManager.volumes;
  }

  /**
   * builds our volume manager class and volume array
   * @constructor
   */
  constructor() {
    VolumeManager.volumes = new Map();
    VolumeManager.initializedVolumes = 0;
    VolumeManager.maxVolumes = 7;
    this.name = "[VolumeManager]";
    this.guid = Util.getGuid();
  }

  /**
   * initialize our databases for our system
   */
  init() {
    log.info(this.name + " initialize memonic databases");
    VolumeManager.initializedVolumes = 1;
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.TALK
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.JOURNAL
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.CIRCUIT
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.TEAM
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.MEMBER
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.DICTIONARY
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.NOTIFICATION
    );

    VolumeManager.loadDefaultJournalDatabase();
    VolumeManager.loadDefaultCircuitDatabase();
    VolumeManager.loadDefaultTeamDatabase();
    VolumeManager.loadDefaultMemberDatabase();
    VolumeManager.loadDefaultDictionaryDatabase();
  }

  /**
   * creates a database inside of a volume that we can manage on the system
   * @param name
   */
  static createDatabaseVolume(name) {
    let db = DatabaseFactory.createDatabase(name);
    VolumeManager.Volumes.set(name, db);
    log.info(
      `[VolumeManager] database volume '${name}' created -> okay`
    );
  }

  /**
   * gets my database volume by name
   * @param name
   * @returns {*}
   */
  getVolumeByName(name) {
    return VolumeManager.Volumes.get(name);
  }

  /**
   * loads our journal database into memory
   */
  static loadDefaultJournalDatabase() {
    global.App.JournalManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our circuit database data into memory
   */
  static loadDefaultCircuitDatabase() {
    global.App.CircuitManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
    global.App.TeamCircuitManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our team data into team database that
   * exists in our memory
   */
  static loadDefaultDictionaryDatabase() {
    global.App.DictionaryManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our team data into team database that
   * exists in our memory
   */
  static loadDefaultTeamDatabase() {
    global.App.TeamManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our member database into our memory
   */
  static loadDefaultMemberDatabase() {
    global.App.MemberManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * do this when we finish loading all of our databases
   */
  static handleFinishLoadingVolumes() {
    VolumeManager.initializedVolumes++;
    if (
      VolumeManager.initializedVolumes >=
      VolumeManager.maxVolumes
    ) {
      EventManager.dispatch(
        EventFactory.Types.DATABASE_VOLUMES_READY
      );
    }
  }
}

module.exports = VolumeManager;
