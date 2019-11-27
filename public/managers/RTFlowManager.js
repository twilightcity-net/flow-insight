const log = require("electron-log"),
  EventFactory = require("./EventFactory"),
  io = require("socket.io-client");

/*
 * This class is used to manage the RealTime Flow server connection
 * as a client. Event should be piped into the client using a client manager.
 */
module.exports = class RTFlowManager {
  constructor() {
    log.info("[RTFlowManager] created -> okay");
    this.events = {
      rtConnected: EventFactory.createEvent(
        EventFactory.Types.WINDOW_RT_FLOW_CONNECTED,
        this
      )
    };
  }

  createConnection() {
    let url =
      global.App.rtFlowUrl +
      "?connectionId=" +
      global.App.connectionStatus.connectionId +
      "&memberId=" +
      global.App.connectionStatus.memberId +
      "&teamId=" +
      global.App.connectionStatus.teamId +
      "&organizationId=" +
      global.App.connectionStatus.organizationId;

    log.info("[RTFlowManager] trying to connect -> " + url);
    let socket = io(url);

    socket.on("connect", () => {
      log.info("[RTFlowManager] SOCKET => connect : " + socket.id);
      this.events.rtConnected.dispatch();
    });
    socket.on("connect_error", error => {
      log.info("[RTFlowManager] SOCKET => connection_error : " + error);

      // TODO add in error handling
      App.handleError(error, true);

      // this.events.rtConnected.dispatch();
    });
    socket.on("connect_timeout", timeout => {
      log.info("[RTFlowManager] SOCKET => connection_timeout : " + timeout);
    });
    socket.on("error", error => {
      log.info("[RTFlowManager] SOCKET => error : " + error);
    });
    socket.on("disconnect", reason => {
      log.info(`[RTFlowManager] SOCKET => reason : ${reason}`);
    });
    socket.on("reconnect", attemptNumber => {
      log.info("[RTFlowManager] SOCKET => reconnect : " + attemptNumber);
    });
    socket.on("reconnect_attempt", attemptNumber => {
      log.info(
        "[RTFlowManager] SOCKET => reconnect_attempt : " + attemptNumber
      );
    });
    socket.on("reconnecting", attemptNumber => {
      log.info("[RTFlowManager] SOCKET => reconnecting : " + attemptNumber);
    });
    socket.on("reconnect_error", error => {
      log.info("[RTFlowManager] SOCKET => reconnect_error : " + error);
    });
    socket.on("reconnect_failed", () => {
      log.info("[RTFlowManager] SOCKET => reconnect_failed");
    });
    socket.on("ping", () => {
      log.info("[RTFlowManager] SOCKET => PING");
    });
    socket.on("pong", latency => {
      log.info("[RTFlowManager] SOCKET => PONG -> " + latency + "ms");
    });
    socket.on("send_message", data => {
      log.info("[RTFlowManager] SOCKET => client sent message : " + data);
    });
  }
};
