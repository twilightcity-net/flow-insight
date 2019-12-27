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

    log.info(chalk.green("[TalkManager]") + " connecting to -> " + url);
    let socket = io(url);

    socket.on("connect", () => {
      log.info(chalk.green("[TalkManager]") + " connect : " + connectionId + " -> " + socket.id);
      this.events.talkConnected.dispatch();
    });
    socket.on("connect_error", error => {
      log.error(chalk.green("[TalkManager]") + " connection error : " + error);
      if (error.message === "timeout") {
        AppError.handleError(error, false);
      }
      else {
        AppError.handleError(error, true);
      }
    });
    socket.on("connect_timeout", (timeout) => {
      log.info(chalk.green("[TalkManager]") + " timeout : " + timeout);
    });
    socket.on("error", (error) => {
      log.info(chalk.green("[TalkManager]") + " error : " + error);
    });
    socket.on("disconnect", (reason) => {
      log.info(chalk.green("[TalkManager]") + " reason : " + reason);
    });
    socket.on("reconnect", (attemptNumber) => {
      log.info(chalk.green("[TalkManager]") + " reconnect " + attemptNumber);
    });
    socket.on("reconnect_attempt", (attemptNumber) => {
      log.info(chalk.green("[TalkManager]") + " reconnection attempt " + attemptNumber);
    });
    socket.on("reconnecting", (attemptNumber) => {
      log.info(chalk.green("[TalkManager]") + " reconnecting " + attemptNumber);
    });
    socket.on("reconnect_error", error => {
      log.info(chalk.red("[TalkManager]") + " reconnection error : " + error);
    });
    socket.on("reconnect_failed", (reason) => {
      log.info(chalk.green("[TalkManager]") + " reconnection failed : " + reason);
    });
    socket.on("pong", latency => {
      log.info(chalk.greenBright("[TalkManager]") + " latency " + latency + "ms");
    });
    socket.on("message_client", (data, fn) => {
      log.info(chalk.cyan("[TalkManager]") + " client message : " + data);
      fn(data);
    });
    socket.on("message_room", data => {
      log.info(chalk.cyan("[TalkManager]") + " room message : " + data);
    });
    socket.on("join_room", (roomId, fn) => {
      log.info(chalk.blue("[TalkManager]") + " joined room '" + roomId + "'");
      fn(roomId);
    });
    socket.on("leave_room", (roomId, fn) => {
      log.info(chalk.blue("[TalkManager]") + " left room '" + roomId + "'");
      fn(roomId);
    });
  }
};
