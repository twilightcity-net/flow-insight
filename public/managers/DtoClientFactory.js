const chalk = require("chalk"),
  log = require("electron-log"),
  request = require("superagent");

/**
 * class used to manage all of the DataStores and data loading / commit
 */
class DtoClientFactory {
  /**
   * builds the dto clients with a factory design pattern
   */
  constructor() {
    this.name = "[DtoClientFactory]";
    log.info(this.name + " created");
  }

  /**
   * performs the http request on the store URI endpoint on gridtime
   * @param store
   * @param callback
   */
  makeStoreRequest(store, callback) {
    let client = new DtoClient(store, callback);
    client.doRequest();
  }

  /**
   * the types of http requests we can make
   * @returns {{POST: string, GET: string}}
   * @constructor
   */
  static get RequestTypes() {
    return {
      POST: "post",
      GET: "get",
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
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };
  }

  /**
   * performs the request on the dto client object
   */
  doRequest() {
    let url = global.App.api + this.urn,
      req = this.getRequest(url);

    log.info(
      chalk.bold.magenta(this.name) +
        " " +
        chalk.hex("#e99e40").bold(this.store.name) +
        " -> " +
        chalk.bold.green(
          "[" + this.type.toUpperCase() + "]"
        ) +
        " { " +
        chalk.bold.magentaBright(url) +
        " }"
    );

    if (!req) {
      throw new Error(
        "Unknown request type ; " + this.type
      );
    } else if (global.App.ApiKey) {
      req.set("X-API-Key", global.App.ApiKey);
    }

    req.end((err, res) => {
      this.store.timestamp = new Date().getTime();
      try {
        if (err) {
          let errObj = err;
          if (
            err.response &&
            err.response.status &&
            err.response.text
          ) {
            errObj = JSON.parse(err.response.text).message;
          }

          throw new Error(errObj);
        }
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

  /**
   * gets the type of request. POST and GET are only supported
   * @param url
   * @returns {*}
   */
  getRequest(url) {
    switch (this.type) {
      case DtoClientFactory.RequestTypes.POST:
        return request
          .post(url)
          .timeout(this.timeout)
          .send(this.store.dto)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");
      case DtoClientFactory.RequestTypes.GET:
        return request
          .get(url)
          .timeout(this.timeout)
          .send(this.store.dto)
          .set("Content-Type", "application/json")
          .set("Accept", "application/json");
      default:
        throw new Error(
          "Unknown request type '" + this.type + "'"
        );
    }
  }
}

module.exports = {
  DtoClientFactory: DtoClientFactory,
  DtoClient: DtoClient,
};
