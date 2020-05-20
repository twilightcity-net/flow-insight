const TeamCircuitController = require("../controllers/TeamCircuitController");
const TalkToController = require("../controllers/TalkToController");
const Util = require("../Util");

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
            let i = 0,
              circuit,
              defaultRoom,
              roomName,
              roomId;
            i < circuits.length;
            i++
          ) {
            circuit = circuits[i];
            defaultRoom = circuit.defaultRoom;
            roomName = defaultRoom.talkRoomName;
            roomId = defaultRoom.talkRoomId;

            TalkToController.instance.handleJoinExistingRoomEvent(
              {},
              {
                id: roomId,
                type:
                  TalkToController.Names.JOIN_EXISTING_ROOM,
                args: {
                  roomName: roomName
                }
              },
              arg => {
                this.handleInitCallback(callback, arg);
              }
            );
          }
        }
      }
    );
  }

  /**
   * handles our callback in response from our controller event processing
   * @param callback
   * @param arg
   */
  handleInitCallback(callback, arg) {
    this.loadCount++;
    if (callback && this.loadCount === 1) {
      callback(arg);
    }
  }
};
