const BaseController = require("./BaseController");

/**
 * This class is used to coordinate controllers across the app classes
 */
module.exports = class AppController extends BaseController {
  constructor(scope) {
    super(scope, AppController);
  }

  /// links associated controller classes here
  static wireControllersTogether() {
    BaseController.wireControllersTo(AppController.instance);
  }

  /// configures application wide events here
  static configureEvents() {
    BaseController.configureEventsFor(AppController.instance);
  }
};
