const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");

/**
 * This class is used to coordinate calls to gridtime for the Fervie service
 * @type {FervieController}
 */
module.exports = class FervieController extends BaseController {
  /**
   * builds our Fervie Client controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, FervieController);
    if (!FervieController.instance) {
        FervieController.instance = this;
        FervieController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible circuit events for fervie
   * @returns {{SAVE_FERVIE_DETAILS: string}}
   * @constructor
   */
  static get Events() {
    return {
      SAVE_FERVIE_DETAILS: "save-fervie-details"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
        FervieController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(FervieController.instance);
    this.fervieClientEventListener = EventFactory.createEvent(
      EventFactory.Types.FERVIE_CLIENT,
      this,
      this.onFervieClientEvent,
      null
    );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onFervieClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        FervieController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case FervieController.Events.SAVE_FERVIE_DETAILS:
          this.handleSaveFervieDetailsEvent(event, arg);
          break;
        default:
          throw new Error(
            "Unknown fervie client event type '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * client event handler for our create new intention function
   * @param event
   * @param arg
   * @param callback
   */
  handleSaveFervieDetailsEvent(event, arg, callback) {
    let fervieColor = arg.args.fervieColor,
      fervieSecondaryColor = arg.args.fervieSecondaryColor,
      fervieTertiaryColor = arg.args.fervieTertiaryColor,
      fervieAccessory = arg.args.fervieAccessory,
      urn =
        FervieController.Paths.FERVIE +
        FervieController.Paths.SEPARATOR +
        FervieController.Strings.ME;

    this.doClientRequest(
      "FervieClient",
      {
          fervieColor: fervieColor,
          fervieSecondaryColor: fervieSecondaryColor,
          fervieTertiaryColor: fervieTertiaryColor,
          fervieAccessory: fervieAccessory
      },
      FervieController.Names.SAVE_FERVIE_DETAILS,
      FervieController.Types.POST,
      urn,
      store =>
        this.delegateSaveFervieDetailsCallback(
          store,
          event,
          arg,
          callback
        )
    );
  }

  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  delegateSaveFervieDetailsCallback(
    store,
    event,
    arg,
    callback
  ) {
    if (store.error) {
      arg.error = store.error;
    } else {
      //details will be pushed to team member DB, so we dont need to save separately
      arg.data = store.data;
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


};
