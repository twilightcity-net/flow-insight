const { dialog } = require("electron"),
  log = require("electron-log"),
  cleanStack = require("clean-stack"),
  request = require("superagent");

//
// class used to manage all of the DataStores and data loading / commit
//
class DataStoreClient {
  constructor() {
    log.info("[DataStoreClient] created -> okay");
  }

  makeStoreRequest(type, store, callback) {
    log.info(
      "[DataStoreClient] make store request -> " + type + " : " + store.name
    );
    let client = null;
    if (DataStoreClient.Stores.ACCOUNT_ACTIVATION_STORE === store.name) {
      client = new DataClient(store, callback);

      /// TODO make a http request and pass in callback
    }
    client.doRequest(type);
  }

  /// enum class of all of http requests
  static get Types() {
    return {
      POST: "post"
    };
  }

  /// enum class of all of the store class names.
  static get Stores() {
    return {
      ACCOUNT_ACTIVATION_STORE: "AccountActivationStore"
    };
  }
}

//
// class used to manage the client request
//
class DataClient {
  constructor(store, callback) {
    log.info("[DataStoreClient] |> create data client");
    this.store = store;
    this.callback = callback;
    // console.log(this.store);
  }

  doRequest(type) {
    let url = "http://localhost:5000/account/activate";
    log.info("[DataStoreClient] |> do request -> " + url);
    if (DataStoreClient.Types.POST === type) {
      request
        .post(url)
        .retry(3)
        .timeout({
          response: 10000,
          deadline: 60000
        })
        .send(this.store.dto)
        .set("Content-Type", "application/json")
        .end((err, res) => {
          log.info("[DataStoreClient] |> request complete -> " + url);
          this.store.timestamp = new Date().getTime();
          try {
            if (err) throw new Error(err);
            this.store.data = res.body;
          } catch (e) {
            this.store.error = e.toString();
            log.error(
              "[DataStoreClient] └> Connection Error -> " +
                type +
                " " +
                url +
                " : " +
                err +
                "\n\n" +
                err.stack +
                "\n"
            );
          } finally {
            log.info(
              "[DataStoreClient] └> dispatch request callback -> " + url
            );
            this.callback(this.store);
          }
        });
    } else {
      log.error(
        "[DataStoreClient] └> Unknown Request Type -> " + type + " " + url
      );
      dialog.showErrorBox(
        "Torchie",
        "Unknown Request Type -> " + type + " " + url
      );
    }
  }
}

//
// class exports for browserify
//
module.exports = {
  DataStoreClient,
  DataClient
};
