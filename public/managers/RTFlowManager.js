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
      console.log("@@@");
      console.log("connect : " + socket.id);
      this.events.rtConnected.dispatch();
    });
    socket.on("connect_error", error => {
      console.log("!!!");
      console.log("connection_error : " + error);

      // TODO add in error handling
      App.handleError(error, true);

      // this.events.rtConnected.dispatch();
    });
    socket.on("connect_timeout", timeout => {
      console.log("!!!");
      console.log("connection_timeout : " + timeout);
    });
    socket.on("error", error => {
      console.log("!!!");
      console.log("error : " + error);
    });
    socket.on("disconnect", reason => {
      console.log("@@@");
      console.log(`reason : ${reason}`);
    });
    socket.on("reconnect", attemptNumber => {
      console.log("&&&");
      console.log("reconnect : " + attemptNumber);
    });
    socket.on("reconnect_attempt", attemptNumber => {
      console.log("&&&");
      console.log("reconnect_attempt : " + attemptNumber);
    });
    socket.on("reconnecting", attemptNumber => {
      console.log("&&&");
      console.log("reconnecting : " + attemptNumber);
    });
    socket.on("reconnect_error", error => {
      console.log("!!!");
      console.log("reconnect_error : " + error);
    });
    socket.on("reconnect_failed", () => {
      console.log("!!!");
      console.log("reconnect_failed");
    });
    socket.on("ping", () => {
      console.log("$$$");
      console.log("PING");
    });
    socket.on("pong", latency => {
      console.log("$$$");
      console.log("PONG -> " + latency);
    });
    socket.on("send_message", data => {
      console.log("###");
      console.log("client sent message : " + data);
    });
  }
};
