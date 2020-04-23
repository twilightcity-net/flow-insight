const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory");

/**
 * The class used to coordinate controllers across the talk service.
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
    BaseController.wireControllersTo(TalkController.instance);
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(TalkController.instance);
    this.appHeartbeatListener = EventFactory.createEvent(
      EventFactory.Types.APP_HEARTBEAT,
      this,
      this.handleAppHeartbeat
    );
    this.appPulseEvent = EventFactory.createEvent(
      EventFactory.Types.APP_PULSE,
      this
    );
    this.talkConnectedEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECTED,
      this
    );
    this.talkConnectFailedEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECT_FAILED,
      this
    );
    this.talkMessageClientEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_MESSAGE_CLIENT,
      this
    );
    this.talkMessageRoomEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_MESSAGE_ROOM,
      this
    );
    this.talkJoinRoomEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_JOIN_ROOM,
      this
    );
    this.talkLeaveRoomEvent = EventFactory.createEvent(
      EventFactory.Types.TALK_LEAVE_ROOM,
      this
    );
  }

  /**
   * A function used to create listeners for this talk controller.
   * @param socket
   * @param connectionId
   */
  configSocketListeners(socket, connectionId, name) {
    // TODO move this to the controller

    socket.on(TalkController.Events.CONNECT, () => {
      log.info(
        chalk.greenBright(name) +
          " connect : " +
          connectionId +
          " -> " +
          socket.id
      );
      this.talkConnectedEvent.dispatch();
    });
    socket.on(TalkController.Events.RECONNECT_ATTEMPT, attempt => {
      log.info(
        chalk.green(name) + " attempt {" + attempt + "} to reconnecting..."
      );
    });
    socket.on(TalkController.Events.RECONNECT_ERROR, err => {
      log.info(chalk.green(name) + " reconnection error : " + err);
    });
    socket.on(TalkController.Events.RECONNECT_FAILED, () => {
      log.info(chalk.greenBright(name) + " unable to reconnect ");
      this.talkConnectFailedEvent.dispatch({
        message: "Sorry, reconnection to 'Talk' FAILED."
      });
    });
    socket.on(TalkController.Events.CONNECT_ERROR, err => {
      log.info(chalk.green(name) + " connection error : " + err);
    });
    socket.on(TalkController.Events.DISCONNECT, reason => {
      log.info(chalk.greenBright(name) + " disconnected : " + reason);
    });
    socket.on(TalkController.Events.CONNECT_TIMEOUT, timeout => {
      log.info(chalk.greenBright(name) + " timeout : " + timeout);
    });
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
      log.info(chalk.green(name) + " latency " + latency + "ms");
      global.App.TalkManager.setLatency(latency);
      this.appPulseEvent.dispatch({
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
      (data, fn) => this.handleSocketMessageClient
    );
    socket.on(
      TalkController.Events.MESSAGE_ROOM,
      data => this.handleSocketMessageRoom
    );
    socket.on(
      TalkController.Events.JOIN_ROOM,
      (roomId, fn) => this.handleSocketJoinRoom
    );
    socket.on(
      TalkController.Events.LEAVE_ROOM,
      (roomId, fn) => this.handleSocketLeaveRoom
    );
  }

  /**
   * handles incoming direct client messages with a socket callback
   * @param data - the data we are sending over the socket connection
   * @param fn - the callback function which is synchronizes the return value.
   */
  handleSocketMessageClient(data, fn) {
    log.info(chalk.green(name) + " client message : " + data);
    this.talkMessageClientEvent.dispatch(data);
    fn();
  }

  /**
   * callback function that our socket uses to delegate our talk room messages
   * @param data - the data that was sent to the talk room
   */
  handleSocketMessageRoom(data) {
    log.info(chalk.green(name) + " room message : " + JSON.stringify(data));

    // TODO store the message into talk database for the specific room's collection

    this.talkMessageRoomEvent.dispatch(data);
  }

  /**
   * handles our socket callback when we join a room on talk or gridtime
   * @param roomId - the room id we wish to join
   * @param fn - the function we use to call back to talk
   */
  handleSocketJoinRoom(roomId, fn) {
    log.info(chalk.greenBright(name) + " joined room '" + roomId + "'");
    this.talkJoinRoomEvent.dispatch(roomId);
    fn(roomId);
  }

  /**
   * handles our socket callback for leaving rooms we have joined
   * @param roomId - the room id we are leaving
   * @param fn - the callback function used to handle the return value
   */
  handleSocketLeaveRoom(roomId, fn) {
    log.info(chalk.greenBright(name) + " left room '" + roomId + "'");
    this.talkLeaveRoomEvent.dispatch(roomId);
    fn(roomId);
  }

  /**
   * event callback for our application heartbeat
   */
  handleAppHeartbeat() {
    let socket = global.App.TalkManager.socket;
    if (!socket.connected) {
      log.info(
        chalk.yellowBright("[AppHeartbeat]") + " reconnecting to Talk..."
      );
      socket.open();
    }
  }
};
