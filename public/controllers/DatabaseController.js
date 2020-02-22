const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory");

/**
 * our controller used by our database farm
 * @type {DatabaseController}
 */
module.exports = class DatabaseController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, DatabaseController);
    if (!DatabaseController.instance) {
      DatabaseController.instance = this;
      DatabaseController.wireControllersTogether();
    }
  }

  /**
   * general enum list of all of our possible database events
   * @returns {String}
   * @constructor
   */
  static get EventTypes() {
    return {
      CREATE_DATABASE: "create-database"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(DatabaseController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(DatabaseController.instance);
    this.databaseClientEventListener = EventFactory.createEvent(
      EventFactory.Types.DATABASE_CLIENT,
      this,
      this.onDatabaseClientEvent,
      null
    );
  }

  /**
   * notified when we get a database event
   * @param event
   * @param arg
   * @returns {string}
   */
  onDatabaseClientEvent(event, arg) {
    log.info(chalk.yellowBright(this.name) + " event : " + JSON.stringify(arg));
    switch (arg.type) {
      case DatabaseController.EventTypes.CREATE_DATABASE:
        this.handleCreateDatabaseEvent(event, arg);
        break;
      default:
        throw new Error(
          "Unknown database client event type '" + arg.type + "'."
        );
    }
  }

  /**
   * callback notifier that is used to create a new database on the fly, ya i know awesome.
   * @param event
   * @param arg
   * @param callback
   */
  handleCreateDatabaseEvent(event, arg, callback) {
    let databaseName = arg.args.dbName;
    // DatabaseFarm
  }
};
