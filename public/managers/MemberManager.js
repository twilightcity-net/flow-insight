const MemberController = require("../controllers/MemberController");
const EventFactory = require("../events/EventFactory");

/**
 * managing class for the team client for the global app scope
 */
class MemberManager {
  constructor() {
    this.name = "[MemberManager]";
    this.myController = new MemberController(this);
    this.myController.configureEvents();
    this.loadCount = 0;

    this.loginConnectionFailed = EventFactory.createEvent(
      EventFactory.Types.WINDOW_LOADING_LOGIN_FAILED,
      this
    );
  }

  /**
   * initializes our Team manager by loading stuff into the database. This is
   * called by our volume manager
   * @param callback
   */
  init(callback) {
    this.loadCount = 0;
    MemberController.instance.handleLoadMeEvent(
      {},
      { args: {} },
      (args) => {
        if (args.error) {
          this.loginConnectionFailed.dispatch({
            message:
              "Unable to lookup account. " + args.error,
          });
        } else {
          this.handleInitCallback(callback);
        }
      }
    );
  }

  /**
   * handles our callback in response from our controller event processing
   * @param callback
   */
  handleInitCallback(callback) {
    this.loadCount++;
    if (callback && this.loadCount === 1) {
      callback();
    }
  }

  /**
   * updates the static object in our member client with our new dto
   * object that represents us.
   * @param me
   */
  updateMe(me) {
    this.myController.updateMeInClient(me);
  }
}

module.exports = MemberManager;
