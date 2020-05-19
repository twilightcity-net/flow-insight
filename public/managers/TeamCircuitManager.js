const TeamCircuitController = require("../controllers/TeamCircuitController");

/**
 * managing class for the team client
 */
module.exports = class TeamCircuitManager {
  /**
   * builds the team manager for the global app scope
   */
  constructor() {
    this.name = "[TeamCircuitManager]";
    this.myController = new TeamCircuitController(this);
    this.myController.configureEvents();
    this.loadCount = 0;
  }

  /**
   * initializes our Team circuit manager by loading stuff into the database. This is
   * called by our volume manager
   * @param callback
   */
  init(callback) {
    TeamCircuitController.instance.handleLoadMyHomeTeamCircuitEvent(
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
};
