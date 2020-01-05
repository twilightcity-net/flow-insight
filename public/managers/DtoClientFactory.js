const { dialog } = require("electron"),
  log = require("electron-log"),
  request = require("superagent");

/**
 * class used to manage all of the DataStores and data loading / commit
 */
class DtoClientFactory {
  constructor() {
    log.info("[DataStoreClient] created -> okay");
  }

  makeStoreRequest(store, callback) {
    let client = new DtoClient(store, callback);
    client.doRequest();
  }

  static get Types() {
    return {
      POST: "post",
      GET: "get"
    };
  }
}

/**
 * class used to manage the client request
 */
class DtoClient {
  constructor(store, callback) {
    this.store = store;
    this.urn = store.urn;
    this.type = store.requestType;
    this.callback = callback;
    this.timeout = {
      response: 9000,
      deadline: 20000
    };
    this.retry = 3;
  }

  doRequest() {
    let url = global.App.api + this.urn;
    log.info(
      "[DataStoreClient] [" +
        this.type.toUpperCase() +
        "] " +
        this.store.name +
        " " +
        url
    );
    if (DtoClientFactory.Types.POST === this.type) {
      this.doPost(url);
    } else if (DtoClientFactory.Types.GET === this.type) {
      this.doGet(url);
    } else {
      log.error(
        "[DataStoreClient] └> Unknown Request Type -> " + this.type + " " + url
      );
      dialog.showErrorBox(
        "Torchie",
        "Unknown Request Type -> " + this.type + " " + url
      );
    }
  }

  doPost(url) {
    let req = request
      .post(url)
      .retry(this.retry)
      .timeout(this.timeout)
      .send(this.store.dto)
      .set("Content-Type", "application/json");

    if (global.App.ApiKey) {
      req.set("X-API-Key", global.App.ApiKey);
    }

    req.end((err, res) => {
      this.store.timestamp = new Date().getTime();
      try {
        if (err) throw new Error(err);
        this.store.data = res.body;
      } catch (e) {
        this.store.error = e.toString();
        log.error(
          "[DataStoreClient] |> Connection Error -> " +
            this.type +
            " " +
            url +
            " : " +
            e +
            "\n\n" +
            e.stack +
            "\n"
        );
      } finally {
        this.callback(this.store);
      }
    });
  }

  doGet(url) {
    let req = request
      .get(url)
      .retry(this.retry)
      .timeout(this.timeout)
      .send(this.store.dto)
      .set("Content-Type", "application/json");

    if (global.App.ApiKey) {
      req.set("X-API-Key", global.App.ApiKey);
    }

    req.end((err, res) => {
      this.store.timestamp = new Date().getTime();
      try {
        if (err) throw new Error(err);
        this.store.data = res.body;
      } catch (e) {
        this.store.error = e.toString();
        log.error(
          "[DataStoreClient] |> Connection Error -> " +
            this.type +
            " " +
            url +
            " : " +
            e +
            "\n\n" +
            e.stack +
            "\n"
        );
      } finally {
        this.callback(this.store);
      }
    });
  }
}

module.exports = {
  DataStoreClient: DtoClientFactory,
  DataClient: DtoClient
};
