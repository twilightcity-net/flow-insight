const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  DictionaryDatabase = require("../database/DictionaryDatabase");

/**
 * This class is used to coordinate controllers across the dictionary service
 * @type {DictionaryController}
 */
module.exports = class DictionaryController extends (
  BaseController
) {
  /**
   * builds our Dictionary Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, DictionaryController);
    if (!DictionaryController.instance) {
      DictionaryController.instance = this;
      DictionaryController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{GET_MY_HOME_TEAM: string, GET_ALL_MY_TEAMS: string, LOAD_MY_HOME_TEAM: string, LOAD_ALL_MY_TEAMS: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_DICTIONARY: "load-dictionary",
      GET_FULL_DICTIONARY: "get-full-dictionary",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      DictionaryController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      DictionaryController.instance
    );
    this.dictionaryClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.DICTIONARY_CLIENT,
        this,
        this.onDictionaryClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onDictionaryClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        DictionaryController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case DictionaryController.Events.LOAD_DICTIONARY:
          this.handleLoadDictionaryEvent(event, arg);
          break;
        case DictionaryController.Events
          .GET_FULL_DICTIONARY:
          this.handleGetFullDictionaryEvent(event, arg);
          break;
        default:
          throw new Error(
            DictionaryController.Error.UNKNOWN +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * Gets all the dictionary items from the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleGetFullDictionaryEvent(event, arg, callback) {
    //load from the DB

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.DICTIONARY
    );

    let view = database.getTeamDictionaryView();
    arg.data = view.data();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * process dictionary events for the listener. returns dto to callback.
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadDictionaryEvent(event, arg, callback) {
    let urn =
      DictionaryController.Paths.DICTIONARY +
      DictionaryController.Paths.SCOPE +
      DictionaryController.Paths.TEAM;

    this.doClientRequest(
      DictionaryController.Contexts.DICTIONARY_CLIENT,
      {},
      DictionaryController.Names.GET_TEAM_DICTIONARY,
      DictionaryController.Types.GET,
      urn,
      (store) =>
        this.delegateLoadTeamDictionaryCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * handles our callback for our gridtime request of loading team dictionary
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateLoadTeamDictionaryCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      let wordList = store.data,
        database = DatabaseFactory.getDatabase(
          DatabaseFactory.Names.DICTIONARY
        );

      if (wordList) {
        database.loadFullDictionary(wordList);
      }
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
