const log = require("electron-log"),
  chalk = require("chalk"),
  TalkController = require("../controllers/TalkController"),
  io = require("socket.io-client");

/**
 * This class is used to manage the Talknet server connection
 * as a client. Event should be piped into the client using a client manager.
 * @type {TalkManager}
 */
module.exports = class TalkManager {
  constructor() {
    this.name = "[TalkManager]";
    this.myController = new TalkController(this);
    this.rooms = [];
  }

  disconnect() {
    try {
      if (this.socket) {
        this.socket.disconnect(true);
        this.socket.destroy();
        this.socket = null;
      }
    } catch (error) {
      log.error(
        "Error while disconnecting from talk: " + error
      );
    }
  }

  /**
   * creates the connection to talk
   */
  createConnection() {
    this.connectionId =
      global.App.connectionStatus.connectionId;
    this.connnectionUrl = this.getConnectionUrl();
    this.connectionOpts = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      secure: true,
    };
    log.info(
      chalk.greenBright(this.name) +
        " connecting to -> " +
        this.connnectionUrl
    );
    this.socket = io(
      this.connnectionUrl,
      this.connectionOpts
    );
    this.myController.configSocketListeners(
      this.socket,
      this.connectionId,
      this.name
    );
    this.myController.wireSocketMessagesToEventCircuit(
      this.socket,
      this.name
    );
    this.latency = 0;
  }

  /**
   * gets the connection url for the io service
   * @returns {string}
   */
  getConnectionUrl() {
    return (
      global.App.talkUrl +
      "?connectionId=" +
      global.App.connectionStatus.connectionId
    );
  }

  /**
   * gets our latency for our talk network
   * @returns {number}
   */
  getLatency() {
    return this.latency;
  }

  /**
   * sets our latency that is used by other functions.
   * @param latency
   */
  setLatency(latency) {
    this.latency = latency;
  }

  /**
   * join a roomId to our rooms array
   * @param roomId
   */
  addRoom(roomId) {
    for (let i = 0, r = null; i < this.rooms.length; i++) {
      r = this.rooms[i];
      if (r === roomId) {
        return;
      }
    }

    log.info(
      chalk.green(this.name) +
        " add to rooms -> " +
        roomId +
        " : {" +
        (this.rooms.length + 1) +
        "}"
    );
    this.rooms.push(roomId);
  }

  /**
   * removes our roomId from our array of rooms we use to figure out
   * what we need to reconnect to.s
   * @param roomId
   */
  removeRoom(roomId) {
    for (
      let r = null, i = this.rooms.length - 1;
      i >= 0;
      --i
    ) {
      r = this.rooms[i];
      if (r === roomId) {
        log.info(
          chalk.green(this.name) +
            " remove from rooms -> " +
            roomId +
            " : {" +
            (this.rooms.length - 1) +
            "}"
        );
        this.rooms.splice(i, 1);
        return;
      }
    }
  }

  /**
   * rejoins any rooms we are part of. typically called when talk
   * connection is restarting.
   */
  rejoinRooms() {
    if (this.rooms.length > 0) {
      for (
        let i = 0, r = null;
        i < this.rooms.length;
        i++
      ) {
        r = this.rooms[i];
        global.App.TalkToManager.joinRoomById(r);
      }
    }
  }
};
