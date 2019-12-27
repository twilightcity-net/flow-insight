const log = require("electron-log"),
  chalk = require("chalk"),
  AppError = require("../app/AppError"),
  EventFactory = require("./EventFactory"),
  io = require("socket.io-client");

/**
 * This class is used to manage the Talk server connection
 * as a client. Event should be piped into the client using a client manager.
 * @type {TalkManager}
 */
module.exports = class TalkManager {
  constructor() {
    log.info("[TalkManager] created -> okay");
    this.name = "[TalkManager]";
    this.events = {
      talkConnected: EventFactory.createEvent(
        EventFactory.Types.WINDOW_TALK_CONNECTED,
        this
      )
    };
  }

  /**
   * creates the connection to talk
   */
  createConnection() {
    let connectionId = global.App.connectionStatus.connectionId,
      paramName = "?connectionId=",
      url = global.App.talkUrl + paramName + connectionId;

    log.info(chalk.green(this.name) + " connecting to -> " + url);
    let socket = io(url);

    this.createListeners(socket, connectionId);
  }

  createListeners(socket, connectionId) {
    socket.on(TalkManager.EventTypes.CONNECT, () => {
      log.info(chalk.green(this.name) + " connect : " + connectionId + " -> " + socket.id);
      this.events.talkConnected.dispatch();
    });
    socket.on(TalkManager.EventTypes.CONNECT_ERROR, (error) => {
      AppError.handleError(error, false, true);
    });
    socket.on(TalkManager.EventTypes.DISCONNECT, (reason) => {
      log.info(chalk.green(this.name) + " disconnected : " + reason);
    });
    socket.on(TalkManager.EventTypes.CONNECT_TIMEOUT, (timeout) => {
      log.info(chalk.green(this.name) + " timeout : " + timeout);
    });
    socket.on(TalkManager.EventTypes.ERROR, (error) => {
      log.info(chalk.green(this.name) + " error : " + error);
    });
    socket.on(TalkManager.EventTypes.RECONNECT_ATTEMPT, (attempt) => {
      log.info(
        chalk.green(this.name) + " attempt {" + attempt + "} to reconnecting..."
      );
    });
    socket.on(TalkManager.EventTypes.RECONNECT, (attempt) => {
      log.info(chalk.green(this.name) + " reconnected {" + attempt + "} times : " + connectionId);
    });
    socket.on(TalkManager.EventTypes.RECONNECT_ERROR, (error) => {
      log.info(chalk.red(this.name) + " reconnection error : " + error);
    });
    socket.on(TalkManager.EventTypes.RECONNECT_FAILED, (reason) => {
      log.info(
        chalk.green(this.name) + " reconnection failed : " + reason
      );
    });
    socket.on(TalkManager.EventTypes.PONG, (latency) => {
      log.info(chalk.greenBright(this.name) + " latency " + latency + "ms");
    });
    socket.on(TalkManager.EventTypes.MESSAGE_CLIENT, (data, fn) => {
      log.info(chalk.cyan(this.name) + " client message : " + data);
      fn(data);
    });
    socket.on(TalkManager.EventTypes.MESSAGE_ROOM, (data) => {
      log.info(chalk.cyan(this.name) + " room message : " + data);
    });
    socket.on(TalkManager.EventTypes.JOIN_ROOM, (roomId, fn) => {
      log.info(chalk.blue(this.name) + " joined room '" + roomId + "'");
      fn(roomId);
    });
    socket.on(TalkManager.EventTypes.LEAVE_ROOM, (roomId, fn) => {
      log.info(chalk.blue(this.name) + " left room '" + roomId + "'");
      fn(roomId);
    });
  }

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
    }
  }
};
