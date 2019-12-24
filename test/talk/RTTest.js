const io = require("socket.io-client");
const chalk = require("chalk");
const log = require("electron-log");

function testTalk() {
  let url = "http://localhost:5000/?clientId=1234567890";
  // let url = "http://ds-talk.herokuapp.com/?key=1234567890";

  log.info(chalk.green("[TalkManager]") + " trying to connect -> " + url);
  let talkClient = io(url);

  talkClient.on("connect", () => {
    log.info(
      chalk.green("[TalkManager]") + " SOCKET => connect : " + talkClient.id
    );
  });
  talkClient.on("connect_error", error => {
    log.error(
      chalk.green("[TalkManager]") + " SOCKET => connection_error : " + error
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
    log.info(chalk.green("[TalkManager]") + " SOCKET => error : " + error);
  });
  talkClient.on("disconnect", reason => {
    log.info(chalk.green("[TalkManager]") + " SOCKET => reason : " + reason);
  });
  talkClient.on("reconnect", attemptNumber => {
    log.info(
      chalk.green("[TalkManager]") + " SOCKET => reconnect : " + attemptNumber
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
      chalk.red("[TalkManager]") + " SOCKET => reconnect_error : " + error
    );
  });
  talkClient.on("reconnect_failed", () => {
    log.info(chalk.green("[TalkManager]") + " SOCKET => reconnect_failed");
  });
  // talkClient.on("ping", () => {
  //   log.info("[TalkManager] SOCKET => PING");
  // });
  talkClient.on("pong", latency => {
    log.info(
      chalk.greenBright("[TalkManager]") + " Socket Ping [" + latency + "ms]"
    );
  });
  talkClient.on("message-client", (data, fn) => {
    log.info(
      chalk.green("[TalkManager]") + " client message : " +
      data
    );
    fn(data);
  });
  talkClient.on("message-room", (data) => {
    log.info(
      chalk.green("[TalkManager]") + " room message : " +
      data
    );
  });
}

testTalk();
