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
  }

  init(callback) {
    TeamController.instance.handleLoadMyTeamEvent(
      {},
      {
        args: {
          type: "primary"
        }
      },
      callback
    );
    TeamController.instance.handleLoadMyCurrentStatus({}, { args: {} }, () => {
      console.log("callback");
    });
  }
};
