const log = require("electron-log"),
  Util = require("../Util"),
  { DataClient } = require("../managers/DataStoreClient"),
  SimpleStatusDto = require("../dto/SimpleStatusDto");

//
// Application class that manages our settings
//
module.exports = class AppLogin {
  static doLogin(callback) {
    log.info("[AppLogin] do login -> setup DataClient");
    this.callback = callback;
    this.urn = "/account/login";
    this.requestType = "post";
    this.store = {
      context: "AppLogin",
      dto: {},
      guid: Util.getGuid(),
      name: "AppLoginStore",
      requestType: this.requestType,
      timestamp: new Date().getTime(),
      urn: this.urn
    };
    log.info("[AppLogin] login data client -> do request");
    let client = new DataClient(this.store, this.callback);
    client.doRequest();
  }

  static isValid() {
    let loginStatus = new SimpleStatusDto(this.store.data);
    return loginStatus.isValid();
  }
};
