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
      rtConnected: EventFactory.createEvent(
        EventFactory.Types.WINDOW_TALK_CONNECTED,
        this
      )
    };
  }

  /**
   * creates the connection to talk
   */
  createConnection() {
    let url =
      global.App.talkUrl +
      "?connectionId=" +
      global.App.connectionStatus.connectionId +
      "&memberId=" +
      global.App.connectionStatus.memberId +
      "&teamId=" +
      global.App.connectionStatus.teamId +
      "&organizationId=" +
      global.App.connectionStatus.organizationId;

    log.info(chalk.green("[TalkManager]") + " trying to connect -> " + url);
    let socket = io(url);

    socket.on("connect", () => {
      log.info(
        chalk.green("[TalkManager]") + " SOCKET => connect : " + socket.id
      );
      this.events.rtConnected.dispatch();
    });
    socket.on("connect_error", error => {
      log.error(
        chalk.green("[TalkManager]") + " SOCKET => connection_error : " + error
      );
      if (error.message === "timeout") {
        AppError.handleError(error, false);
      } else {
        AppError.handleError(error, true);
      }
    });
    socket.on("connect_timeout", timeout => {
      log.info(
        chalk.green("[TalkManager]") +
          " SOCKET => connection_timeout : " +
          timeout
      );
    });
    socket.on("error", error => {
      log.info(chalk.green("[TalkManager]") + " SOCKET => error : " + error);
    });
    socket.on("disconnect", reason => {
      log.info(chalk.green("[TalkManager]") + " SOCKET => reason : " + reason);
    });
    socket.on("reconnect", attemptNumber => {
      log.info(
        chalk.green("[TalkManager]") + " SOCKET => reconnect : " + attemptNumber
      );
    });
    socket.on("reconnect_attempt", attemptNumber => {
      log.info(
        chalk.green("[TalkManager]") +
          " SOCKET => reconnect_attempt : " +
          attemptNumber
      );
    });
    socket.on("reconnecting", attemptNumber => {
      log.info(
        chalk.green("[TalkManager]") +
          " SOCKET => reconnecting : " +
          attemptNumber
      );
    });
    socket.on("reconnect_error", error => {
      log.info(
        chalk.red("[TalkManager]") + " SOCKET => reconnect_error : " + error
      );
    });
    socket.on("reconnect_failed", () => {
      log.info(chalk.green("[TalkManager]") + " SOCKET => reconnect_failed");
    });
    socket.on("ping", () => {
      // log.info("[TalkManager] SOCKET => PING");
    });
    socket.on("pong", latency => {
      log.info(
        chalk.greenBright("[TalkManager]") + " Socket Ping [" + latency + "ms]"
      );
    });
    socket.on("send_message", data => {
      log.info(
        chalk.green("[TalkManager]") +
          " SOCKET => client sent message : " +
          data
      );
    });
  }
};
