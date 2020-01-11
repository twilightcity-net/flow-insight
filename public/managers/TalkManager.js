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
    this.myController = new TalkController(this);
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
  }

  /**
   * gets the connectioon url for the io service
   * @returns {string}
   */
  getConnectionUrl() {
    return global.App.talkUrl + "?connectionId=" + this.connectionId;
  }

  /**
   * publish a chat message to a room with a talk message
   * @param active
   * @param roomId
   * @param chatMessageStr
   */
  publishChatToRoom(active, roomId, chatMessageStr, callback) {
    let chatMessage = new ChatMessageInputDto({
        chatMessage: chatMessageStr
      }),
      uri = active
        ? "/talk/to/room/active/chat"
        : "/talk/to/room/" + roomId + "/chat";
    this.myController.doClientRequest(
      "TalkToClient",
      chatMessage,
      "publishChatToRoom",
      "post",
      uri,
      dto => {
        console.log(
          this.name +
            " publish chat message : " +
            roomId +
            " -> " +
            chatMessageStr
        );
        callback(dto);
      }
    );
  }

  /**
   * publish a snippet to a room with through a talk message
   * @param active
   * @param roomId
   * @param comment
   * @param eventType
   * @param position
   * @param source
   * @param snippet
   */
  publishSnippetToRoom(
    active,
    roomId,
    comment,
    eventType,
    position,
    source,
    snippet,
    callback
  ) {
    let newSnippet = new NewSnippetEvent({
        comment: comment,
        eventType: eventType,
        position: position,
        source: source,
        snippet: snippet
      }),
      uri = active
        ? "/talk/to/room/active/snippet"
        : "/talk/to/room/" + roomId + "/snippet";
    this.myController.doClientRequest(
      "TalkToClient",
      newSnippet,
      "publishSnippetToRoom",
      "post",
      uri,
      dto => {
        console.log(
          this.name + " publish snippet message : " + roomId + " -> " + snippet
        );
        callback(dto);
      }
    );
  }

  /**
   * publish screenshot to a room with a talk message
   * @param active
   * @param roomId
   * @param fileName
   * @param filePath
   * @param callback
   */
  publishScreenshotToRoom(active, roomId, fileName, filePath, callback) {
    let screenshotRef = new ScreenshotReferenceInputDto({
        fileName: fileName,
        filePath: filePath
      }),
      uri = active
        ? "/talk/to/room/active/screenshot"
        : "/talk/to/room/" + roomId + "/screenshot";
    this.myController.doClientRequest(
      "TalkToClient",
      screenshotRef,
      "publishScreenshotToRoom",
      "post",
      uri,
      dto => {
        console.log(
          this.name +
            " publish screenshot message : " +
            roomId +
            " -> " +
            screenshotRef.filePath
        );
        callback(dto);
      }
    );
  }
}

module.exports = TalkManager;
