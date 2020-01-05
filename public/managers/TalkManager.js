const log = require("electron-log"),
  chalk = require("chalk"),
  TalkController = require("../controllers/TalkController"),
  ChatMessageInputDto = require("../dto/ChatMessageInputDto"),
  NewSnippetEvent = require("../dto/NewSnippetEvent"),
  ScreenshotReferenceInputDto = require("../dto/ScreenshotReferenceInputDto"),
  io = require("socket.io-client");

/**
 * This class is used to manage the Talk server connection
 * as a client. Event should be piped into the client using a client manager.
 * @type {TalkManager}
 */
class TalkManager {
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
    this.myController.wireSocketMessagesToEventCircuit(this.socket, this.name);
    // this.getAllTalkMessagesFromRoom("angry_teachers")
  }

  /**
   * gets the connectioon url for the io service
   * @returns {string}
   */
  getConnectionUrl() {
    return global.App.talkUrl + "?connectionId=" + this.connectionId;
  }

  /**
   * gets all the talk message from a specific room, Uses our exiating dto store system
   */
  getAllTalkMessagesFromRoom(roomId) {
    this.myController.doClientRequest(
      "TalkToClient",
      roomId,
      "getAllTalkMessagesFromRoom",
      "get",
      "/talk/to/room/" + roomId,
      dto => {
        console.log(
          this.name + " get all of the talk messages for room : " + roomId
        );
        console.log(dto);
      }
    );
  }

  /**
   * publish a chat message to a room with a talk message
   */
  publishChatToRoom(active, roomId, chatMessageStr) {
    let chatMessage = new ChatMessageInputDto({
      chatMessage: chatMessageStr
    });
    this.myController.doClientRequest(
      "TalkToClient",
      chatMessage,
      "publishChatToRoom",
      "post",
      "/talk/to/room/" + roomId + "/chat",
      dto => {
        console.log(
          this.name +
            " publish chat message : " +
            roomId +
            " -> " +
            chatMessageStr
        );
        console.log(dto);
      }
    );
  }

  /**
   * publish a snippet to a room with through a talk message
   */
  publishSnippetToRoom(
    active,
    roomId,
    comment,
    eventType,
    position,
    source,
    snippet
  ) {
    let newSnippet = new NewSnippetEvent({
      comment: comment,
      eventType: eventType,
      position: position,
      source: source,
      snippet: snippet
    });
    this.myController.doClientRequest(
      "TalkToClient",
      newSnippet,
      "publishSnippetToRoom",
      "post",
      "/talk/to/room/" + roomId + "/snippet",
      dto => {
        console.log(
          this.name + " publish snippet message : " + roomId + " -> " + snippet
        );
        console.log(dto);
      }
    );
  }

  /**
   * publish screenshot to a room with a talk message
   */
  publishScreenshotToRoom(active, roomId, fileName, filePath) {
    let screenshotRef = new ScreenshotReferenceInputDto({
      fileName: fileName,
      filePath: filePath
    });
    this.myController.doClientRequest(
      "TalkToClient",
      screenshotRef,
      "publishScreenshotToRoom",
      "post",
      "/talk/to/room/" + roomId + "/screenshot",
      dto => {
        console.log(
          this.name +
            " publish screenshot message : " +
            roomId +
            " -> " +
            screenshotRef.filePath
        );
        console.log(dto);
      }
    );
  }
}

module.exports = TalkManager;
