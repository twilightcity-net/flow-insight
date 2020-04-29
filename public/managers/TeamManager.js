const TeamController = require("../controllers/TeamController");

/**
 * managing class for the team client
 */
module.exports = class TeamManager {
  /**
   * builds the team manager for the global app scope
   */
  constructor() {
    this.name = "[TeamManager]";
    this.myController = new TeamController(this);
    this.myController.configureEvents();
    this.loadCount = 0;
  }

  /**
   * initializes our Team manager by loading stuff into the database. This is
   * called by our volume manager
   * @param callback
   */
  init(callback) {
    TeamController.instance.handleLoadMyTeamEvent(
      {},
      {
        args: {
          type: "primary"
        }
      },
      () => this.handleInitCallback(callback)
    );
    TeamController.instance.handleLoadMyCurrentStatus(
      {},
      { args: {} },
      () => this.handleInitCallback(callback)
    );
    TeamController.instance.handleLoadStatusOfMeAndMyTeam(
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
    if (callback && this.loadCount === 3) {
      callback();
    }
  }
};
