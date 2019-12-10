const log = require("electron-log"),
  Util = require("../Util");

/**
 * This class is used to coordinate controllers across the app classes
 */
module.exports = class BaseController {
  constructor(scope, clazz) {
    this.className = "[" + clazz.name + "]";
    this.scope = scope;
    this.guid = Util.getGuid();
    if (!clazz.instance) {
      clazz.instance = clazz;
      clazz.instance.wireControllersTogether();
    }
  }

  /// for override
  static wireControllersTo(clazz) {
    log.info(
      "[" + BaseController.name + "] wire controllers to -> " + clazz.name
    );
  }

  /// for override
  static configureEventsFor(clazz) {
    log.info(
      "[" + BaseController.name + "] configure events for -> " + clazz.name
    );
  }
};
