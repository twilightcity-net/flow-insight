const log = require("electron-log"),
  chalk = require("chalk"),
  TalkController = require("../controllers/TalkController"),
  io = require("socket.io-client");

/**
 * This class is used to manage the Talk server connection
 * as a client. Event should be piped into the client using a client manager.
 * @type {TalkManager}
 */
module.exports = class TalkManager {
  constructor() {
    this.name = "[TalkManager]";
  }

  /**
   * creates the connection to talk
   */
  createConnection() {
    this.myController = new TalkController();
    this.connectionId = global.App.connectionStatus.connectionId;
    this.connnectionUrl = this.getConnectionUrl();
    this.connectionOpts = {
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 3000,
      reconnectionAttempts: 3
    };
    log.info(
      chalk.greenBright(this.name) + " connecting to -> " + this.connnectionUrl
    );
    this.socket = io(this.connnectionUrl, this.connectionOpts);
    this.myController.configSocketListeners(
      this.socket,
      this.connectionId,
      this.name
    );
    this.myController.wireSocketMessagesToEventCircuit(
      this.socket,
      this.name
    );
  }

  /**
   * gets the connectioon url for the io service
   * @returns {string}
   */
  getConnectionUrl() {
    return global.App.talkUrl + "?connectionId=" + this.connectionId;
  }
};
