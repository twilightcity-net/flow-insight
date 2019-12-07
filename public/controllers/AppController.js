const BaseController = require("./BaseController");

/**
 * This class is used to coordinate controllers across the app classes
 */
module.exports = class AppController extends BaseController {
  constructor(scope) {
    super("[AppController]", scope, AppController);
    // AppController.instance = this;
  }

  /// links associated controller classes here
  wireControllersTogether() {
    super.wireControllersTogether();

    // TODO add app controllers here
  }

  /// configures application wide events here
  configureEvents() {
    super.configureEvents();

    // TODO wire up app events here, call init event functions from here
  }

  test() {
    super.test();
  }
};
