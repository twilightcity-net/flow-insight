const { DataStoreClient } = require("./DtoClientFactory"),
  EventFactory = require("../managers/EventFactory");

/**
 * lass used to manage all of the DataStores and data loading / commit
 * @type {DtoClientManager}
 */
module.exports = class DtoClientManager {
  constructor() {
    this.name = "[DataStoreManager]";
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
    let store = arg;
    this.client.makeStoreRequest(store, store => {
      this.events.dataStoreLoaded.dispatch(store);
    });
  }
};
