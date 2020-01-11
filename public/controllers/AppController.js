const AppError = require("../app/AppError"),
  BaseController = require("./BaseController");

/**
 * This class is used to coordinate controllers across the app classes
 * @type {AppController}
 */
module.exports = class AppController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, AppController);
    if (!AppController.instance) {
      AppController.instance = this;
      AppController.wireControllersTogether();
    }
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(AppController.instance);
  }

  /**
   * configures application wide events here
   */
  static configureEvents() {
    BaseController.configEvents(AppController.instance);
    process.on("uncaughtException", error => {
      AppError.handleError(error, true);
    });
    process.on("unhandledRejection", error => {
      AppError.handleError(error, true);
    });
  }
};
