const MemberController = require("../controllers/MemberController");

/**
 * managing class for the team client for the global app scope
 */
class MemberManager {
  constructor() {
    this.name = "[MemberManager]";
    this.myController = new MemberController(this);
    this.myController.configureEvents();
    this.loadCount = 0;
  }

  /**
   * initializes our Team manager by loading stuff into the database. This is
   * called by our volume manager
   * @param callback
   */
  init(callback) {
    MemberController.instance.handleLoadMeEvent(
      {},
      { args: {} },
      () => this.handleInitCallback(callback)
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
