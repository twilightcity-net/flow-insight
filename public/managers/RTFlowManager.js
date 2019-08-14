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
    log.info("[RTFlowManager] trying to connect to : " + global.App.rtFlowUrl);
    var socket = io(global.App.rtFlowUrl);
    socket.on("connect", () => {
      console.log("@@@");
      console.log("client connected");
      this.events.rtConnected.dispatch();
    });
    socket.on("connect_error", error => {
      console.log("@@@");
      console.log("unable to connected");
      this.events.rtConnected.dispatch();
    });
  }
};
