const { DtoClientFactory } = require("./DtoClientFactory"),
  EventFactory = require("../managers/EventFactory");

/**
 * lass used to manage all of the DataStores and data loading / commit
 * @type {DtoClientManager}
 */
module.exports = class DtoClientManager {
  constructor() {
    this.name = "[DataStoreManager]";
    this.client = new DtoClientFactory();
    this.events = {
      dtoClientLoad: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOAD,
        this,
        this.onDataStoreLoadCb
      ),
      dtoClientLoaded: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOADED,
        this
      )
    };
  }

  onDataStoreLoadCb(event, arg) {
    let store = arg;
    this.client.makeStoreRequest(store, store => {
      this.events.dtoClientLoaded.dispatch(store);
    });
  }
};
