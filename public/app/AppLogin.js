const log = require("electron-log"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory"),
  ConnectionStatusDto = require("../dto/ConnectionStatusDto");
const AppConfig = require("./AppConfig");

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
    let params = "?appName="+AppConfig.appName+ "&version="+AppConfig.version;

    const primaryOrgId = global.App.AppSettings.getPrimaryOrganizationId();

    this.urn = "/account/login"+params;

    if (primaryOrgId) {
      this.urn = "/account/login/to/organization/"+primaryOrgId + params;
    }

    this.callback = callback;
    this.requestType = "post";
    this.store = {
      context: "AppLogin",
      dto: {},
      guid: Util.getGuid(),
      name: "AppLoginStore",
      requestType: this.requestType,
      timestamp: new Date().getTime(),
      urn: this.urn,
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
      urn: this.urn,
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
    log.debug("getConnectionStatus");

    try {
      if (this.store.error) {
        log.debug("error found..." + this.store.error);
        return new ConnectionStatusDto({
          message: this.store.error + " Login failed",
          status: "ERROR",
        });
      } else {
        return  new ConnectionStatusDto(
          this.store.data
        );
      }
    } catch (e) {
      log.error("[AppLogin] " + e);
      let errorStatus = new ConnectionStatusDto({
        message: e.toString(),
        status: "ERROR",
      });
      return errorStatus;
    }
  }
};
