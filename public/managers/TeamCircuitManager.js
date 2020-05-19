const TeamCircuitController = require("../controllers/TeamCircuitController");
const TalkToController = require("../controllers/TalkToController");

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
    TeamCircuitController.instance.handleLoadAllMyTeamCircuitsEvent(
      {},
      { args: {} },
      arg => {
        let circuits = arg.data;
        if (circuits && circuits.length > 0) {
          for (
            let i = 0, circuit = null;
            i < circuits.length;
            i++
          ) {
            circuit = circuits[i];

            let homeRoom = circuit.defaultRoom,
              homeRoomName = homeRoom.talkRoomName;

            console.log(homeRoom);

            TalkToController.instance.handleJoinExistingRoomEvent(
              {},
              {
                args: {
                  roomName: homeRoomName
                }
              },
              arg => {
                console.log("###", arg);
              }
            );
          }
        }

        this.handleInitCallback(callback);
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
};
