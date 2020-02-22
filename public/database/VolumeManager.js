const log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  { EventManager } = require("../events/EventManager"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * this is used to store a database of references to our in memory databases
 * @type {VolumeFactory}
 */
module.exports = class VolumeManager {
  static get Volumes() {
    return VolumeManager.volumes;
  }

  static get DatabaseNames() {
    return {
      TALK: "talk"
    };
  }

  constructor() {
    VolumeManager.volumes = [];
    this.name = "[VolumeManager]";
    this.scope = global.App;
    this.guid = Util.getGuid();
  }

  init() {
    log.info(this.name + " initialize memonic databases");
    VolumeManager.createDatabaseVolume(
      VolumeManager.DatabaseNames.TALK,
      this.scope
    );
  }

  static createDatabaseVolume(dbName, scope) {
    let db = DatabaseFactory.create(dbName, scope);
    VolumeManager.Volumes.push(db);
    log.info("[VolumeManager] database volumes created -> okay");
    EventManager.dispatch(EventFactory.Types.DATABASE_VOLUMES_READY);
  }
};
