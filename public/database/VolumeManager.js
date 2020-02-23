const log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  { EventManager } = require("../events/EventManager"),
  DatabaseFactory = require("./DatabaseFactory");

/**
 * this is used to store a database of references to our in memory databases
 * @type {VolumeManager}
 */
module.exports = class VolumeManager {
  /**
   * global static array we store our database volumes in
   * @returns {array}
   * @constructor
   */
  static get Volumes() {
    return VolumeManager.volumes;
  }

  /**
   * builds our volume manager class and volume array
   */
  constructor() {
    VolumeManager.volumes = [];
    this.name = "[VolumeManager]";
    this.guid = Util.getGuid();
  }

  /**
   * initialize our databases for our system
   */
  init() {
    log.info(this.name + " initialize memonic databases");
    VolumeManager.createDatabaseVolume(DatabaseFactory.Names.TALK);
    VolumeManager.createDatabaseVolume(DatabaseFactory.Names.JOURNAL);
    VolumeManager.createDatabaseVolume(DatabaseFactory.Names.CIRCUIT);
    VolumeManager.createDatabaseVolume(DatabaseFactory.Names.TEAM);
    EventManager.dispatch(EventFactory.Types.DATABASE_VOLUMES_READY);
  }

  /**
   * creates a database inside of a volume that we can manage on the system
   * @param dbName
   */
  static createDatabaseVolume(dbName) {
    let db = DatabaseFactory.create(dbName);
    VolumeManager.Volumes.push(db);
    log.info("[VolumeManager] database volumes created -> okay");
  }
};
