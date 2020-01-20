const chalk = require("chalk"),
  log = require("electron-log"),
  request = require("superagent");

/**
 * class used to manage all of the DataStores and data loading / commit
 */
class DtoClientFactory {
  constructor() {
    this.name = "[DtoClientFactory]";
    log.info(this.name + " created");
  }

  makeStoreRequest(store, callback) {
    let client = new DtoClient(store, callback);
    client.doRequest();
  }

  static get RequestTypes() {
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
    this.name = "[DtoClient]";
    this.store = store;
    this.urn = store.urn;
    this.type = store.requestType;
    this.callback = callback;
    this.retry = 3;
    this.timeout = {
      response: 9000,
      deadline: 20000
    };
  }

  doRequest() {
    let url = global.App.api + this.urn,
      req = this.getRequest(url);

    log.info(
      chalk.magenta(this.name) +
        " [" +
        this.type.toUpperCase() +
        "] " +
        this.store.name +
        " " +
        url
    );

    if (!req) {
      throw new Error("Unknown request type ; " + this.type);
    } else if (global.App.ApiKey) {
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
          this.name +
            " Connection Error -> " +
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

  getRequest(url) {
    return DtoClientFactory.RequestTypes.POST === this.type
      ? request
          .post(url)
          .retry(this.retry)
          .timeout(this.timeout)
          .send(this.store.dto)
          .set("Content-Type", "application/json")
      : DtoClientFactory.RequestTypes.GET === this.type
      ? request
          .get(url)
          .retry(this.retry)
          .timeout(this.timeout)
          .send(this.store.dto)
          .set("Content-Type", "application/json")
      : null;
  }
}

module.exports = {
  DtoClientFactory: DtoClientFactory,
  DtoClient: DtoClient
};
