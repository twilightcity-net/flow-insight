const TeamCircuitController = require("../controllers/TeamCircuitController");
const TalkToController = require("../controllers/TalkToController");
const Util = require("../Util");
const AppError = require("../app/AppError");
const EventFactory = require("../events/EventFactory");

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

    this.talkConnectFailedListener =
      EventFactory.createEvent(
        EventFactory.Types.TALK_CONNECT_FAILED,
        this
      );
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
      (arg) => {
        if (arg.error) {
          this.talkConnectFailedListener.dispatch({
            message:
              "Failed to lookup talk circuit rooms. " +
              arg.error,
          });
        } else {
          this.connectToTalkRooms(arg.data, callback);
        }
      }
    );
  }

  connectToTalkRooms(circuits, callback) {
    let loadCountNeeded = circuits.length;

    if (circuits && circuits.length > 0) {
      for (let i = 0; i < circuits.length; i++) {
        let circuit = circuits[i];
        let defaultRoom = circuit.defaultRoom;
        let roomName = defaultRoom.talkRoomName;
        let roomId = defaultRoom.talkRoomId;

        TalkToController.instance.handleJoinExistingRoomEvent(
          {},
          {
            id: roomId,
            type: TalkToController.Names.JOIN_EXISTING_ROOM,
            args: {
              roomName: roomName,
            },
          },
          (arg) => {
            this.handleInitCallback(
              callback,
              arg,
              loadCountNeeded
            );
          }
        );
      }
    } else {
      //make sure we always callback, even if there are no team circuits, dont want to freeze the app
      this.handleInitCallback(callback, {}, 0);
    }
  }

  /**
   * handles our callback in response from our controller event processing
   * @param callback
   * @param arg
   * @param loadCountNeeded
   */
  handleInitCallback(callback, arg, loadCountNeeded) {
    this.loadCount++;
    if (arg.error) {
      this.loadCount = -100; //make sure the app stops on failure
      this.talkConnectFailedListener.dispatch({
        message:
          "Failed to connect to talk circuit rooms. " +
          arg.error,
      });
    } else {
      if (callback && this.loadCount === loadCountNeeded) {
        callback(arg);
      }
    }
  }
};
