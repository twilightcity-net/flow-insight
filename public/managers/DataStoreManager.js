const log = require("electron-log"),
  { DataStoreClient } = require("./DataStoreClient"),
  EventFactory = require("../managers/EventFactory");

//
// class used to manage all of the DataStores and data loading / commit
module.exports = class DataStoreManager {
  constructor() {
    log.info("[DataStoreManager] created -> okay");
    this.client = new DataStoreClient();
    this.events = {
      dataStoreLoad: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOAD,
        this,
        this.onDataStoreLoadCb
      ),
      dataStoreLoaded: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOADED,
        this
      )
    };
  }

  onDataStoreLoadCb(event, arg) {
    log.info(
      "[DataStoreManager] data store load -> " + arg.name + " : " + arg.guid
    );
    let store = arg;
    this.client.makeStoreRequest(store, store => {
      this.events.dataStoreLoaded.dispatch(store);
    });
  }
};
