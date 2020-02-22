const Util = require("../Util"),
  EventFactory = require("../events/EventFactory");

/**
 * the class that is used to store a database of references to
 * our in memory databases
 * @type {DataWarehouse}
 */
module.exports = class DatabaseFarm {
  static get Databases() {
    return DatabaseFarm.databases;
  }

  constructor(scope) {
    DatabaseFarm.databases = [];
    this.name = "[DatabaseFarm]";
    this.scope = scope;
    this.guid = Util.getGuid();
    this.events = {
      databaseFarmReadyNotifier: EventFactory.createEvent(
        EventFactory.Types.DATABASE_FARM_READY
      )
    };
  }

  init() {
    console.log(this.name + " load our databases");
    setTimeout(() => {
      console.log(this.name + " databases loaded -> okay");
      this.events.databaseFarmReadyNotifier.dispatch();
    }, 2000);
  }
};
