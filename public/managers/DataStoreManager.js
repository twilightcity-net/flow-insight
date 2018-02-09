const log = require("electron-log"),
  EventFactory = require("../managers/EventFactory");

//
// class used to manage all of the DataStores and data loading / commit
module.exports = class DataStoreManager {
  constructor() {
    log.info("[DataStoreManager] created -> okay");
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
    console.log("DATASTORE_LOAD");
    console.log(arg);
    arg.timestamp = new Date().getTime();
    arg.data = {
      status: "VALID",
      message: "Your account has been successfully activated.",
      email: "kara@dreamscale.io",
      apiKey: "FASFD423fsfd32d2322d"
    };
    console.log("DATASTORE_LOAD_RESPONSE");
    console.log(arg);
    this.events.dataStoreLoaded.dispatch(arg);
  }
};
