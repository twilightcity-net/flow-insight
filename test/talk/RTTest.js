const io = require("socket.io-client");
const chalk = require("chalk");
const log = require("electron-log");

function testTalk() {
  let connectionId = "1234567890";
  // let url = "http://localhost:5000/?connectionId=" + connectionId;
  let url =
      "https://gridtalk.twilightcity.net?connectionId=" +
      connectionId,
    isSecure = true;

  log.info(
    chalk.green("[TalkManager]") +
      " trying to connect -> " +
      url
  );
  let talkClient = io.connect(url, { secure: isSecure });

  talkClient.on("connect", () => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => connect : " +
        talkClient.id
    );
  });
  talkClient.on("connect_error", error => {
    log.error(
      chalk.green("[TalkManager]") +
        " SOCKET => connection_error : " +
        error
    );
  });
  talkClient.on("connect_timeout", timeout => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => connection_timeout : " +
        timeout
    );
  });
  talkClient.on("error", error => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => error : " +
        error
    );
  });
  talkClient.on("disconnect", reason => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => reason : " +
        reason
    );
  });
  talkClient.on("reconnect", attemptNumber => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => reconnect : " +
        attemptNumber
    );
  });
  talkClient.on("reconnect_attempt", attemptNumber => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => reconnect_attempt : " +
        attemptNumber
    );
  });
  talkClient.on("reconnecting", attemptNumber => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => reconnecting : " +
        attemptNumber
    );
  });
  talkClient.on("reconnect_error", error => {
    log.info(
      chalk.red("[TalkManager]") +
        " SOCKET => reconnect_error : " +
        error
    );
  });
  talkClient.on("reconnect_failed", () => {
    log.info(
      chalk.green("[TalkManager]") +
        " SOCKET => reconnect_failed"
    );
  });
  // talkClient.on("ping", () => {
  //   log.info("[TalkManager] SOCKET => PING");
  // });
  talkClient.on("pong", latency => {
    log.info(
      chalk.greenBright("[TalkManager]") +
        " Socket Ping [" +
        latency +
        "ms]"
    );
  });
  talkClient.on("message_client", (data, fn) => {
    log.info(
      chalk.cyan("[TalkManager]") +
        " client message : " +
        data
    );
    fn(data);
  });
  talkClient.on("message_room", data => {
    log.info(
      chalk.cyan("[TalkManager]") +
        " room message : " +
        data
    );
  });
  talkClient.on("join_room", (roomId, fn) => {
    log.info(
      chalk.blue("[TalkManager]") +
        " joined room '" +
        roomId +
        "'"
    );
    fn(roomId);
  });
  talkClient.on("leave_room", (roomId, fn) => {
    log.info(
      chalk.blue("[TalkManager]") +
        " left room '" +
        roomId +
        "'"
    );
    fn(roomId);
  });
}

testTalk();
