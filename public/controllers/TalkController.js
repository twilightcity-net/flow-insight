const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  Util = require("../Util"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  AppLogin = require("../app/AppLogin");

/**
 * This class is used to coordinate controllers across the talknet service
 * @type {TalkController}
 */
module.exports = class TalkController extends (
  BaseController
) {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope, messageCounter) {
    super(scope, TalkController);
    if (!TalkController.instance) {
      TalkController.instance = this;
      TalkController.wireControllersTogether();
      this.configureEvents();

      this.messageCounter = messageCounter;
    }
  }

  /**
   * general enum list of all of our possible talk events
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
      LEAVE_ROOM: "leave_room",
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
    this.talkConnectFailedListener =
      EventFactory.createEvent(
        EventFactory.Types.TALK_CONNECT_FAILED,
        this
      );
    this.talkMessageClientListener =
      EventFactory.createEvent(
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

    this.meDataRefreshNotifier = EventFactory.createEvent(
      EventFactory.Types.ME_DATA_REFRESH,
      this
    );

    this.teamDataRefreshNotifier = EventFactory.createEvent(
      EventFactory.Types.TEAM_DATA_REFRESH,
      this
    );

    this.circuitDataRefreshNotifier =
      EventFactory.createEvent(
        EventFactory.Types.CIRCUIT_DATA_REFRESH,
        this
      );

    this.journalDataRefreshNotifier =
      EventFactory.createEvent(
        EventFactory.Types.JOURNAL_DATA_REFRESH,
        this
      );

    this.dictionaryDataRefreshNotifier =
      EventFactory.createEvent(
        EventFactory.Types.DICTIONARY_DATA_REFRESH,
        this
      );

    this.notificationRefreshNotifier =
      EventFactory.createEvent(
        EventFactory.Types.NOTIFICATION_DATA_REFRESH,
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
      this.talkConnectedEvent.dispatch({});
    });
    socket.on(
      TalkController.Events.RECONNECT_ATTEMPT,
      (attempt) => {
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
      (err) => {
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
            "Oops, The Talknet service seems to be offline, please try again soon.",
        });
      }
    );
    socket.on(
      TalkController.Events.CONNECT_ERROR,
      (err) => {
        log.info(
          chalk.green(name) + " connection error : " + err
        );
        this.talkConnectFailedListener.dispatch({
          message:
            "Oops, The Talknet service seems to be offline, please try again soon.",
        });
      }
    );

    socket.on(
      TalkController.Events.DISCONNECT,
      (reason) => {
        log.info(
          chalk.greenBright(name) +
            " disconnected : " +
            reason
        );
        if (reason.includes("server disconnect")) {
          //if the server booted us, clear this socket connection so we can reconnect from scratch
          global.App.TalkManager.disconnect();
        }
      }
    );
    socket.on(
      TalkController.Events.CONNECT_TIMEOUT,
      (timeout) => {
        log.info(
          chalk.greenBright(name) + " timeout : " + timeout
        );
      }
    );
    socket.on(TalkController.Events.ERROR, (err) => {
      log.info(chalk.redBright(name) + " error : " + err);
    });
    socket.on(
      TalkController.Events.RECONNECT,
      (attempt) => {
        log.info(
          chalk.greenBright(name) +
            " reconnected {" +
            attempt +
            "} times : " +
            connectionId
        );
      }
    );
    socket.on(TalkController.Events.PONG, (latency) => {
      log.info(
        chalk.green(name) + " latency " + latency + "ms"
      );

      global.App.TalkManager.setLatency(latency);
      this.appPulseNotifier.dispatch({
        latencyTime: latency,
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
          chalk.green(name) +
            " client message : " +
            JSON.stringify(data)
        );
        try {
          this.handleTalkMessageDirectCallback(data);
        } catch (e) {
          log.error(
            chalk.red(this.name) +
              " " +
              e +
              "\n\n" +
              e.stack +
              "\n"
          );
        }

        fn();
      }
    );
    socket.on(
      TalkController.Events.MESSAGE_ROOM,
      (data) => {
        log.info(
          chalk.green(name) +
            " room message : " +
            JSON.stringify(data)
        );
        this.handleTalkMessageRoomCallback(data);
      }
    );
    socket.on(
      TalkController.Events.JOIN_ROOM,
      (roomId, fn) => {
        log.info(
          chalk.greenBright(name) +
            " joined room '" +
            roomId +
            "'"
        );
        try {
          global.App.TalkManager.addRoom(roomId);
          this.talkJoinRoomListener.dispatch(roomId);
        } catch (e) {
          log.error(
            chalk.red(this.name) +
              " " +
              e +
              "\n\n" +
              e.stack +
              "\n"
          );
        }

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
        try {
          global.App.TalkManager.removeRoom(roomId);
          this.talkLeaveRoomListener.dispatch(roomId);
        } catch (e) {
          log.error(
            chalk.red(this.name) +
              " " +
              e +
              "\n\n" +
              e.stack +
              "\n"
          );
        }

        fn(roomId);
      }
    );
  }

  /**
   * event handler that our application heartbeat is trigged by. This function
   * checks our global socket that we are connected to talk with. if we are
   * not connected, then we should try to reconnect back to talk.
   */
  onAppHeartbeat(event, dto) {
    log.info("HEARTBEAT " + JSON.stringify(dto));
    let socket = global.App.TalkManager.socket;

    if (
      (socket == null || (socket && !socket.connected)) &&
      (dto.status === "SUCCESS" || dto.status === "REFRESH")
    ) {
      this.refreshDataFromScratch();
      this.reconnectToTalk(socket);
    } else if (
      socket &&
      socket.connected &&
      dto.status === "REFRESH"
    ) {
      this.refreshDataFromScratch();
    } else if (dto.status === "FAILED") {
      //will get a new talk connection, so don't retry to reconnect the existing one
      this.reinitializeLogin();
    } else {
      this.reconnectToTalk(socket);
    }
  }

  reconnectToTalk(socket) {
    if (socket && !socket.connected) {
      log.info(
        chalk.yellowBright("[TalkController]") +
          " reconnecting to Talk..."
      );
      socket.open();
    }

    if (socket == null) {
      this.reinitializeLogin();
    }
  }

  reinitializeLogin() {
    global.App.TalkManager.disconnect();

    AppLogin.doLogin(() => {
      log.info(
        chalk.greenBright("[TalkController]") +
          " Re-logged in to reset all connections..."
      );
      let dto = AppLogin.getConnectionStatus();
      if (dto.status === "ERROR") {
        log.error("Application is offline.");
        global.App.isOnline = false;
        global.App.isLoggedIn = false;
      } else {
        log.info("Application is back online.");
        global.App.isOnline = true;
        global.App.isLoggedIn = true;
        global.App.connectionStatus = dto;
        global.App.TalkManager.createConnection();
      }
    });
  }

  refreshDataFromScratch() {
    //first update the DB, then on the callback, tell the UI panels to refresh
    global.App.MemberManager.init(() => {
      this.meDataRefreshNotifier.dispatch({});

      global.App.TeamManager.init(() => {
        this.teamDataRefreshNotifier.dispatch({});
      });

      global.App.CircuitManager.init(() => {
        this.circuitDataRefreshNotifier.dispatch({});
      });
    });

    global.App.DictionaryManager.init(() => {
      this.dictionaryDataRefreshNotifier.dispatch({});
    });

    global.App.JournalManager.reset(() => {
      this.journalDataRefreshNotifier.dispatch({});
    });
  }

  trackMessage(uri, nanoTime, message) {
    this.messageCounter.trackMessage(
      uri,
      nanoTime,
      message
    );
  }

  static fromUserNameMetaPropsStr = "from.username";
  static fromMemberIdMetaPropsStr = "from.member.id";

  static PAIRING_REQUEST = "PAIRING_REQUEST";
  static PAIRING_CANCELLATION = "PAIRING_CANCELLATION";
  static PAIRING_CONFIRMED = "PAIRING_CONFIRMED";

  /**
   * our event callback handler for direct talk messages. This function sorts incoming talk
   * messages into status and details.s
   * @param message - our message that was received via the talk network socket
   */
  handleTalkMessageDirectCallback(message) {
    switch (message.messageType) {
      case TalkController.MessageTypes.PAIRING_REQUEST:
        this.handlePairingRequest(message);
        break;
      case TalkController.MessageTypes.PENDING_BUDDY_REQUEST:
        this.handlePendingBuddyRequest(message);
        break;
      default:
        console.warn(
          chalk.bgRed(
            TalkController.Error.UNKNOWN_TALK_MESSAGE_TYPE +
              " '" +
              message.messageType +
              "'."
          )
        );
        break;
    }
    this.talkMessageClientListener.dispatch(message);
  }

  handlePendingBuddyRequest(message) {
    let id = message.id,
      messageTime = message.messageTime,
      metaProps = message.metaProps,
      buddyDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.BUDDY
      );

    buddyDatabase.addPendingBuddyRequest(message.data);
  }

  handlePairingRequest(message) {
    let id = message.id,
      messageTime = message.messageTime,
      metaProps = message.metaProps,
      notificationDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.NOTIFICATION
      );

    let fromMemberId = metaProps[TalkController.fromMemberIdMetaPropsStr];
    let fromUsername = metaProps[TalkController.fromUserNameMetaPropsStr];

    let pairingRequestType = message.data.pairingRequestType;

    switch (pairingRequestType) {
      case TalkController.PAIRING_REQUEST:
        notificationDatabase.addNotification({
          id: id,
          type: pairingRequestType,
          timestamp: messageTime,
          fromMemberId: fromMemberId,
          fromUsername: fromUsername,
          read: false,
          canceled: false,
          data: message.data,
        });
        this.notificationRefreshNotifier.dispatch({});
        break;
      case TalkController.PAIRING_CONFIRMED:
        notificationDatabase.removePairRequest(
          fromMemberId
        );
        break;
      case TalkController.PAIRING_CANCELLATION:
        notificationDatabase.cancelNotification(
          TalkController.PAIRING_REQUEST,
          fromMemberId
        );
        this.notificationRefreshNotifier.dispatch({});
        break;
    }
  }
  /**
   * our event callback handler talk messages. This function sorts incoming talk
   * messages into status and details.s
   * @param message - our message that was received via the talk network socket
   */
  handleTalkMessageRoomCallback(message) {
    let uri = message.uri, //this is the roomId
      nanoTime = message.nanoTime,
      metaProps = message.metaProps,
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
      dictionaryDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.DICTIONARY
      ),
      notificationDatabase = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.NOTIFICATION
      ),
      messageCollection =
        talkDatabase.getCollectionForRoomTalkMessages(uri),
      statusCollection =
        talkDatabase.getCollectionForRoomStatusTalkMessages(
          uri
        ),
      fromUsername = metaProps[TalkController.fromUserNameMetaPropsStr],
      fromMemberId = metaProps[TalkController.fromMemberIdMetaPropsStr],
      me = this.getMemberMe(),
      model = {};

    this.trackMessage(uri, nanoTime, message);

    switch (message.messageType) {
      case TalkController.MessageTypes.CIRCUIT_STATUS:
        this.findXOrInsertDoc(
          model,
          statusCollection,
          message
        );
        break;
      case TalkController.MessageTypes.CIRCUIT_MEMBER_STATUS_EVENT:
        this.handleRoomMemberStatusEvent(
          message,
          circuitDatabase
        );
        break;
      case TalkController.MessageTypes.ROOM_MEMBER_STATUS_EVENT:
        talkDatabase.updateRoomMemberStatus(
          uri,
          message.data
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
      case TalkController.MessageTypes.TEAM_MEMBER_ADDED:
        memberDatabase.updateMemberInMembers(
          message.data.teamMemberDto
        );
        teamDatabase.addTeamMemberInTeamsIfMissing(
          message.data
        );
        break;
      case TalkController.MessageTypes.TEAM_MEMBER_REMOVED:
        let isMe = memberDatabase.isMe(
          message.data.memberId
        );
        teamDatabase.removeTeamMemberFromTeams(
          isMe,
          message.data
        );
        break;
      case TalkController.MessageTypes.XP_STATUS_UPDATE:
        memberDatabase.updateXPStatusByTeamMemberId(
          message.data
        );
        teamDatabase.updateTeamMemberXPSummaryInTeams(
          message.data
        );
        break;
      case TalkController.MessageTypes.DICTIONARY_UPDATE:
        dictionaryDatabase.updateDictionaryWord(
          message.data
        );
        break;
      case TalkController.MessageTypes.TERMINAL_CMD_RESULT:
      case TalkController.MessageTypes.TERMINAL_ENVVARIABLE:
      case TalkController.MessageTypes.TERMINAL_CIRCUIT_CLOSED:
        break;
      case TalkController.MessageTypes.WTF_STATUS_UPDATE:
        const data = message.data,
          circuit = data.learningCircuitDto;

        switch (data.statusType) {
          case TalkController.StatusTypes.TEAM_WTF_STARTED:
            if (Util.isCircuitOwnerModerator(me, circuit)) {
              circuitDatabase.createNewCircuit(circuit);
              circuitDatabase.setActiveCircuit(circuit);
            }
            break;
          case TalkController.StatusTypes.TEAM_WTF_THRESHOLD:
            if (fromUsername !== me.username) {
              console.log("XXX Adding threshold notification!! ");
              notificationDatabase.addNotification({
                id: message.id,
                type: TalkController.StatusTypes.TEAM_WTF_THRESHOLD,
                timestamp: message.messageTime,
                fromMemberId: fromMemberId,
                fromUsername: fromUsername,
                read: false,
                canceled: false,
                data: message.data,
              });
              this.notificationRefreshNotifier.dispatch({});
            }
            break;
          case TalkController.StatusTypes.TEAM_WTF_UPDATED:
            circuitDatabase.updateCircuitForDescription(
              circuit,
              me
            );
            break;
          case TalkController.StatusTypes.TEAM_WTF_JOINED:
          case TalkController.StatusTypes.TEAM_WTF_PAIR_JOIN:
            this.handleTeamWtfJoined(
              message,
              me,
              circuitDatabase
            );
            break;
          case TalkController.StatusTypes.TEAM_WTF_LEAVE:
            this.handleTeamWtfLeave(
              message,
              me,
              circuitDatabase
            );
            break;
          case TalkController.StatusTypes.TEAM_WTF_ON_HOLD:
            notificationDatabase.cancelThresholdNotificationsFromUser(fromMemberId);
            circuitDatabase.updateCircuitToDoItLater(
              circuit,
              me
            );
            memberDatabase.removeActiveCircuitFromMembers(
              circuit
            );
            break;
          case TalkController.StatusTypes.TEAM_WTF_RESUMED:
            switch (circuit.circuitState) {
              case TalkController.CircuitStates
                .TROUBLESHOOT:
                circuitDatabase.updateCircuitForResume(
                  circuit,
                  me,
                  data.memberId
                );
                break;
              default:
                console.warn(
                  chalk.bgRed(
                    TalkController.Error
                      .UNKNOWN_STATE_TYPE +
                      " '" +
                      circuit.circuitState +
                      "'."
                  )
                );
                break;
            }
            break;
          case TalkController.StatusTypes.TEAM_WTF_SOLVED:
            notificationDatabase.cancelThresholdNotificationsFromUser(fromMemberId);
            circuitDatabase.solveActiveCircuit(circuit);
            memberDatabase.removeActiveCircuitFromMembers(
              circuit
            );
            break;
          case TalkController.StatusTypes.TEAM_RETRO_STARTED:
            circuitDatabase.startRetroForCircuit(circuit);
            break;
          case TalkController.StatusTypes.TEAM_WTF_CANCELED:
            notificationDatabase.cancelThresholdNotificationsFromUser(fromMemberId);
            circuitDatabase.removeCircuitFromAllCollections(
              circuit
            );
            memberDatabase.removeActiveCircuitFromMembers(
              circuit
            );
            break;
          case TalkController.StatusTypes.TEAM_WTF_CLOSED:
            circuitDatabase.removeCircuitFromAllCollections(
              circuit
            );
            memberDatabase.removeActiveCircuitFromMembers(
              circuit
            );
            break;
          case TalkController.StatusTypes.TEAM_RETRO_CLOSED:
            this.logMessage(
              "TalkController",
              "TEAM_RETRO_CLOSED"
            );
            circuitDatabase.removeCircuitFromAllCollections(
              circuit
            );
            break;
          default:
            console.warn(
              chalk.bgRed(
                TalkController.Error.UNKNOWN_STATUS_TYPE +
                  " '" +
                  data.statusType +
                  "'."
              )
            );
            break;
        }
        break;
      case TalkController.MessageTypes.INTENTION_STARTED_DETAILS:
        journalDatabase.updateIntention(message.data.journalEntry);
        break;
      case TalkController.MessageTypes.INTENTION_FINISHED_DETAILS:
        journalDatabase.updateIntention(message.data.journalEntry);
        break;
      case TalkController.MessageTypes.INTENTION_ABORTED_DETAILS:
        journalDatabase.updateIntention(message.data.journalEntry);
        break;
      case TalkController.MessageTypes.JOURNAL_ENTRY_DTO:
        journalDatabase.updateIntention(message.data);
        break;
      case TalkController.MessageTypes.FERVIE_SEAT_EVENT:
      case TalkController.MessageTypes.MOOVIE_STATUS_UPDATE:
      case TalkController.MessageTypes.PUPPET_MESSAGE:
      case TalkController.MessageTypes.CHAT_REACTION:
        break;
      default:
        console.warn(
          chalk.bgRed(
            TalkController.Error.UNKNOWN_TALK_MESSAGE_TYPE +
              " '" +
              message.messageType +
              "'."
          )
        );
        break;
    }

    this.talkMessageRoomListener.dispatch(message);
  }

  /**
   * processes our talk message for circuit member status events. This event
   * will update the circuit members collection in the circuit database.
   * @param message
   * @param circuitDatabase
   */
  handleRoomMemberStatusEvent(message, circuitDatabase) {
    let data = message.data,
      circuitMembers = [data.roomMember];

    switch (data.statusEvent) {
      case TalkController.CircuitMemberStatus
        .CIRCUIT_MEMBER_JOIN:
        circuitDatabase.updateCircuitMembersInCollection(
          message.uri,
          circuitMembers,
          circuitDatabase.getCollectionForCircuitMembers(
            message.uri
          )
        );
        break;
      case TalkController.CircuitMemberStatus
        .CIRCUIT_MEMBER_LEAVE:
        circuitDatabase.updateCircuitMembersInCollection(
          message.uri,
          circuitMembers,
          circuitDatabase.getCollectionForCircuitMembers(
            message.uri
          ),
          true
        );
        break;
      default:
        console.warn(
          chalk.bgRed(
            TalkController.Error.UNKNOWN_STATUS_TYPE +
              " '" +
              data.statusType +
              "'."
          )
        );
        break;
    }
  }

  /**
   * processes our team wtf joined event. This is emitted from gridtime over
   * the talk network for when a circuit member participates in the circuit.
   * This functions checks to see if our member id of the active TC
   * user matches that of the talk message.
   * @param message
   * @param me
   * @param circuitDatabase
   */
  handleTeamWtfJoined(message, me, circuitDatabase) {
    let data = message.data,
      memberId = data.memberId,
      circuit = data.learningCircuitDto;

    if (memberId === me.id) {
      circuitDatabase.joinActiveCircuit(circuit);
    }
  }

  /**
   * processes our leave active circuit request from gridtime. This message
   * is emitted from gridtime and sent via talk. We ignore other team
   * members whom leave, we need to remove the circuit from the circuit
   * database and active collection.
   * @param message
   * @param me
   * @param circuitDatabase
   */
  handleTeamWtfLeave(message, me, circuitDatabase) {
    let data = message.data,
      memberId = data.memberId,
      circuit = data.learningCircuitDto;

    if (memberId === me.id) {
      circuitDatabase.leaveActiveCircuit(circuit);
    }
  }
};
