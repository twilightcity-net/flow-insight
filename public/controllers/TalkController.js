const log = require("electron-log"),
  chalk = require("chalk"),
  BaseController = require("./BaseController"),
  EventFactory = require("../managers/EventFactory");

/**
 * This class is used to coordinate controllers across the talk service
 * @type {AppController}
 */
module.exports = class TalkController extends BaseController {
  /**
   *
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, TalkController);
    this.configureEvents();
  }

  /**
   * general enum list of all of our possible talk events
   * @returns {String}
   * @constructor
   */
  static get EventTypes() {
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
    BaseController.configureEventsFor(TalkController.instance);
    this.appHeartbeatListener = EventFactory.createEvent(
      EventFactory.Types.APP_HEARTBEAT,
      this,
      this.onAppHeartbeat
    );
    this.talkConnectedListener = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECTED,
      this
    );
    this.talkConnectFailedListener = EventFactory.createEvent(
      EventFactory.Types.TALK_CONNECT_FAILED,
      this
    );
  }

  /**
   * creates the listeners for the manager. this should be moved into the controler
   * @param socket
   * @param connectionId
   */
  configureListeners(socket, connectionId, name) {
    // TODO move this to the controller

    socket.on(TalkController.EventTypes.CONNECT, () => {
      log.info(
        chalk.greenBright(name) +
          " connect : " +
          connectionId +
          " -> " +
          socket.id
      );
      this.talkConnectedListener.dispatch();
    });
    socket.on(TalkController.EventTypes.RECONNECT_ATTEMPT, attempt => {
      log.info(
        chalk.green(name) + " attempt {" + attempt + "} to reconnecting..."
      );
    });
    socket.on(TalkController.EventTypes.RECONNECT_ERROR, err => {
      log.info(chalk.green(name) + " reconnection error : " + err);
    });
    socket.on(TalkController.EventTypes.RECONNECT_FAILED, () => {
      log.info(chalk.greenBright(name) + " unable to reconnect ");
      this.talkConnectFailedListener.dispatch({
        message:
          "Opps, The Talk service seems to be offline, please try again soon."
      });
    });
    socket.on(TalkController.EventTypes.CONNECT_ERROR, err => {
      log.info(chalk.green(name) + " connection error : " + err);
    });
    socket.on(TalkController.EventTypes.DISCONNECT, reason => {
      log.info(chalk.greenBright(name) + " disconnected : " + reason);
    });
    socket.on(TalkController.EventTypes.CONNECT_TIMEOUT, timeout => {
      log.info(chalk.greenBright(name) + " timeout : " + timeout);
    });
    socket.on(TalkController.EventTypes.ERROR, err => {
      log.info(chalk.redBright(name) + " error : " + err);
    });
    socket.on(TalkController.EventTypes.RECONNECT, attempt => {
      log.info(
        chalk.greenBright(name) +
          " reconnected {" +
          attempt +
          "} times : " +
          connectionId
      );
    });
    socket.on(TalkController.EventTypes.PONG, latency => {
      log.info(chalk.green(name) + " latency " + latency + "ms");
    });
    socket.on(TalkController.EventTypes.MESSAGE_CLIENT, (data, fn) => {
      log.info(chalk.green(name) + " client message : " + data);
      fn(data);
    });
    socket.on(TalkController.EventTypes.MESSAGE_ROOM, data => {
      log.info(chalk.green(name) + " room message : " + data);
    });
    socket.on(TalkController.EventTypes.JOIN_ROOM, (roomId, fn) => {
      log.info(chalk.greenBright(name) + " joined room '" + roomId + "'");
      fn(roomId);
    });
    socket.on(TalkController.EventTypes.LEAVE_ROOM, (roomId, fn) => {
      log.info(chalk.greenBright(name) + " left room '" + roomId + "'");
      fn(roomId);
    });
  }

  onAppHeartbeat() {
    console.log("$$$$$$$$$$");
  }
};
