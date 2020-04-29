const log = require("electron-log"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory"),
  ConnectionStatusDto = require("../dto/ConnectionStatusDto");

/**
 * Application class that manages our settings
 * @type {AppLogin}
 */
module.exports = class AppLogin {
  /**
   * general use function to login the app
   * @param callback
   */
  static doLogin(callback) {
    log.info("[AppLogin] do login -> setup DtoClient");
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
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }

  /**
   * general use function to logout the app
   * @param callback
   */
  static doLogout(callback) {
    log.info("[AppLogin] do logout -> setup DtoClient");
    this.callback = callback;
    this.urn = "/account/logout";
    this.requestType = "post";
    this.store = {
      context: "AppLogout",
      dto: {},
      guid: Util.getGuid(),
      name: "AppLogoutStore",
      requestType: this.requestType,
      timestamp: new Date().getTime(),
      urn: this.urn
    };
    log.info("[AppLogin] logout data client -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }

  /**
   * checks to see if the login response is a valid login
   * @returns {ConnectionStatusDto}
   */
  static getConnectionStatus() {
    try {
      let connectionStatus = new ConnectionStatusDto(
        this.store.data
      );
      return connectionStatus;
    } catch (e) {
      log.error("[AppLogin] " + e);
      let connectionStatus = new ConnectionStatusDto({
        message: e.toString(),
        status: "ERROR"
      });
      return connectionStatus;
    }
  }
};
