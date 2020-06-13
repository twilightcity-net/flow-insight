const log = require("electron-log"),
  chalk = require("chalk"),
  Util = require("../Util"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  TalkDatabase = require("../database/TalkDatabase"),
  MemberDatabase = require("../database/MemberDatabase"),
  JournalDatabase = require("../database/JournalDatabase"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  DatabaseUtil = require("../database/DatabaseUtil");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {TalkController}
 */
module.exports = class TalkController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TalkController);
    if (!TalkController.instance) {
      TalkController.instance = this;
      TalkController.wireControllersTogether();
      this.configureEvents();
    }
  }

  /**
   * general enum list of all of our possible talk events
   * @returns {String}
   * @constructor
   */
  static get Events() {
    return {
      CONNECT: "connect",
      CONNECT_ERROR: "connect_error",
      DISCONNECT: "disconnect",
      CONNECT_TIMEOUT: "connect_timeout",
      ERROR: "error",
      RECONNECT_ATTEMPT: "reconnect_attempt",
      RECONNECT: "reconnect",
      RECONNECT_ERROR: "reconnect_error",
      RECONNECT_FAILED: "reconnect_failed",
      PONG: "pong",
      MESSAGE_CLIENT: "message_client",
      MESSAGE_ROOM: "message_room",
      JOIN_ROOM: "join_room",
      LEAVE_ROOM: "leave_room"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireControllersTogether() {
    BaseController.wireControllersTo(
      TalkController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TalkController.instance);
    this.appHeartbeatListener = EventFactory.createEvent(
      EventFactory.Types.APP_HEARTBEAT,
      this,
      this.onAppHeartbeat
    );
    this.appPulseNotifier = EventFactory.createEvent(
      EventFactory.Types.APP_PULSE,
      this
    );
    this.talkConnectedEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECTED,
      this
    );
    this.talkConnectFailedListener = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECT_FAILED,
      this
    );
    this.talkMessageClientListener = EventFactory.createEvent(
      EventFactory.Types.TALK_MESSAGE_CLIENT,
      this
    );
    this.talkMessageRoomListener = EventFactory.createEvent(
      EventFactory.Types.TALK_MESSAGE_ROOM,
      this
    );
    this.talkJoinRoomListener = EventFactory.createEvent(
      EventFactory.Types.TALK_JOIN_ROOM,
      this
    );
    this.talkLeaveRoomListener = EventFactory.createEvent(
      EventFactory.Types.TALK_LEAVE_ROOM,
      this
    );
  }

  /**
   * creates the listeners for the manager. this should be moved into the controler
   * @param socket
   * @param connectionId
   * @param name
   */
  configSocketListeners(socket, connectionId, name) {
    socket.on(TalkController.Events.CONNECT, () => {
      log.info(
        chalk.greenBright(name) +
          " connect : " +
          connectionId +
          " -> " +
          socket.id
      );
      global.App.TalkManager.rejoinRooms();
      this.talkConnectedEvent.dispatch();
    });
    socket.on(
      TalkController.Events.RECONNECT_ATTEMPT,
      attempt => {
        log.info(
          chalk.green(name) +
            " attempt {" +
            attempt +
            "} to reconnecting..."
        );
      }
    );
    socket.on(
      TalkController.Events.RECONNECT_ERROR,
      err => {
        log.info(
          chalk.green(name) + " reconnection error : " + err
        );
      }
    );
    socket.on(
      TalkController.Events.RECONNECT_FAILED,
      () => {
        log.info(
          chalk.greenBright(name) + " unable to reconnect "
        );
        this.talkConnectFailedListener.dispatch({
          message:
            "Opps, The Talk service seems to be offline, please try again soon."
        });
      }
    );
    socket.on(TalkController.Events.CONNECT_ERROR, err => {
      log.info(
        chalk.green(name) + " connection error : " + err
      );
    });
    socket.on(TalkController.Events.DISCONNECT, reason => {
      log.info(
        chalk.greenBright(name) +
          " disconnected : " +
          reason
      );
    });
    socket.on(
      TalkController.Events.CONNECT_TIMEOUT,
      timeout => {
        log.info(
          chalk.greenBright(name) + " timeout : " + timeout
        );
      }
    );
    socket.on(TalkController.Events.ERROR, err => {
      log.info(chalk.redBright(name) + " error : " + err);
    });
    socket.on(TalkController.Events.RECONNECT, attempt => {
      log.info(
        chalk.greenBright(name) +
          " reconnected {" +
          attempt +
          "} times : " +
          connectionId
      );
    });
    socket.on(TalkController.Events.PONG, latency => {
      log.info(
        chalk.green(name) + " latency " + latency + "ms"
      );
      global.App.TalkManager.setLatency(latency);
      this.appPulseNotifier.dispatch({
        latencyTime: latency
      });
    });
  }

  /**
   * this function is used to connect the socket events for client and room messages into the event system
   * @param socket
   * @param name
   */
  wireSocketMessagesToEventCircuit(socket, name) {
    socket.on(
      TalkController.Events.MESSAGE_CLIENT,
      (data, fn) => {
        log.info(
          chalk.green(name) + " client message : " + data
        );
        this.talkMessageClientListener.dispatch(data);
        fn();
      }
    );
    socket.on(TalkController.Events.MESSAGE_ROOM, data => {
      log.info(
        chalk.green(name) +
          " room message : " +
          JSON.stringify(data)
      );
      this.handleTalkMessageRoomCallback(data);
    });
    socket.on(
      TalkController.Events.JOIN_ROOM,
      (roomId, fn) => {
        log.info(
          chalk.greenBright(name) +
            " joined room '" +
            roomId +
            "'"
        );
        global.App.TalkManager.addRoom(roomId);
        this.talkJoinRoomListener.dispatch(roomId);
        fn(roomId);
      }
    );
    socket.on(
      TalkController.Events.LEAVE_ROOM,
      (roomId, fn) => {
        log.info(
          chalk.greenBright(name) +
            " left room '" +
            roomId +
            "'"
        );
        global.App.TalkManager.removeRoom(roomId);
        this.talkLeaveRoomListener.dispatch(roomId);
        fn(roomId);
      }
    );
  }

  /**
   * our event callback handler talk messages. This function sorts incoming talk
   * messages into status and details.s
   * @param message - our message that was received via the talk network socket
   */
  handleTalkMessageRoomCallback(message) {
    let uri = message.uri,
      talkDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TALK
      ),
      teamDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.TEAM
      ),
      memberDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.MEMBER
      ),
      circuitDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.CIRCUIT
      ),
      journalDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.JOURNAL
      ),
      messageCollection = talkDatabase.getCollectionForRoomTalkMessages(
        uri
      ),
      statusCollection = talkDatabase.getCollectionForRoomStatusTalkMessages(
        uri
      ),
      membersCollection = memberDatabase.getCollection(
        MemberDatabase.Collections.MEMBERS
      ),
      intentionsCollection = journalDatabase.getCollection(
        JournalDatabase.Collections.INTENTIONS
      ),
      me = this.getMemberMe(),
      model = {};

    switch (message.messageType) {
      case TalkController.MessageTypes.CIRCUIT_STATUS:
        this.findXOrInsertDoc(
          model,
          statusCollection,
          message
        );
        break;
      case TalkController.MessageTypes
        .ROOM_MEMBER_STATUS_EVENT:
        this.findXOrInsertDoc(
          model,
          statusCollection,
          message
        );
        break;
      case TalkController.MessageTypes.CHAT_MESSAGE_DETAILS:
        this.findXOrInsertDoc(
          model,
          messageCollection,
          message
        );
        break;
      case TalkController.MessageTypes.TEAM_MEMBER:
        memberDatabase.updateMemberInMembers(message.data);
        teamDatabase.updateTeamMemberInTeams(message.data);
        break;
      case TalkController.MessageTypes.XP_STATUS_UPDATE:
        memberDatabase.updateXPStatusByTeamMemberId(
          message.data
        );
        teamDatabase.updateTeamMemberXPSummaryInTeams(
          message.data
        );
        break;
      case TalkController.MessageTypes.WTF_STATUS_UPDATE:
        let data = message.data,
          circuit = data.learningCircuitDto;

        switch (data.statusType) {
          case TalkController.StatusTypes.TEAM_WTF_STARTED:
            if (me.id !== data.memberId) {
              circuitDatabase.insertCircuitOrUpdateCircuitState(
                circuit
              );
            }
            break;
          case TalkController.StatusTypes.TEAM_WTF_STOPPED:
            if (
              circuit.circuitState ===
              TalkController.CircuitStates.CANCELED
            ) {
              circuitDatabase.removeCircuitFromAllCollections(
                circuit
              );
              memberDatabase.removeActiveCircuitFromMembers(
                circuit
              );
            } else {
              console.warn(
                TalkController.Error.UNKNOWN_STATE_TYPE +
                  " '" +
                  circuit.circuitState +
                  "'."
              );
            }
            break;
          default:
            console.warn(
              TalkController.Error.UNKNOWN_STATUS_TYPE +
                " '" +
                data.statusType +
                "'."
            );
            break;
        }
        break;
      case TalkController.MessageTypes
        .INTENTION_STARTED_DETAILS:
        let mData = message.data,
          journalEntry = mData.journalEntry;

        journalDatabase.findRemoveInsert(
          journalEntry,
          intentionsCollection
        );
        DatabaseUtil.log(
          "update journal entry",
          journalEntry.id
        );
        break;
      default:
        console.warn(
          TalkController.Error.UNKNOWN_TALK_MESSAGE_TYPE +
            " '" +
            message.messageType +
            "'."
        );
        break;
    }

    this.talkMessageRoomListener.dispatch(message);
  }

  /**
   * event handler that our application heartbeat is trigged by. This function
   * checks our global socket that we are connected to talk with. if we are
   * not connected, then we should try to reconnect back to talk.
   */
  onAppHeartbeat() {
    let socket = global.App.TalkManager.socket;
    if (!socket.connected) {
      log.info(
        chalk.yellowBright("[AppHeartbeat]") +
          " reconnecting to Talk..."
      );
      socket.open();
    }
  }
};
