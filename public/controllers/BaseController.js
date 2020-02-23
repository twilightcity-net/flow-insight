const log = require("electron-log"),
  Util = require("../Util"),
  { DtoClient } = require("../managers/DtoClientFactory");

/**
 * This class is used to coordinate controllers across the app classes
 */
module.exports = class BaseController {
  constructor(scope, clazz) {
    this.name = "[" + clazz.name + "]";
    this.scope = scope;
    this.guid = Util.getGuid();
  }

  /**
   * called for every controller automagically
   * @param clazz
   */
  static wireControllersTo(clazz) {
    log.info(
      "[" + BaseController.name + "] wire controllers to -> " + clazz.name
    );
  }

  /**
   * called for every controller automagically
   * @param clazz
   */
  static configEvents(clazz) {
    log.info(
      "[" + BaseController.name + "] configure events for -> " + clazz.name
    );
  }

  /**
   * this function makes a request to the Journal Client interface on gridtime server. This will be
   * worked into our existing data client and model system.
   * @param context
   * @param dto
   * @param name
   * @param type
   * @param urn
   * @param callback
   */

  doClientRequest(context, dto, name, type, urn, callback) {
    let store = {
      context: context,
      dto: dto,
      guid: Util.getGuid(),
      name: name,
      requestType: type,
      timestamp: new Date().getTime(),
      urn: urn
    };
    let client = new DtoClient(store, callback);
    client.doRequest();
  }
};
