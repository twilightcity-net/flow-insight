const io = require("socket.io-client");
const chalk = require("chalk");
const log = require("electron-log");

function testTalk() {
  let url = "http://localhost:5000/?key=1234567890";
  // let url = "http://lds-talk.herokuapp.com/?connectionId=1234567890";

  log.info(chalk.green("[TalkManager]") + " trying to connect -> " + url);
  let socket = io(url);

  socket.on("connect", () => {
    log.info(
      chalk.green("[TalkManager]") + " SOCKET => connect : " + socket.id
    );
  });
  socket.on("connect_error", error => {
    log.error(
      chalk.green("[TalkManager]") + " SOCKET => connection_error : " + error
    );
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
  socket.on("send_message", (data, fn) => {
    log.info(
      chalk.green("[TalkManager]") +
      " SOCKET` => client sent message : " +
      data
    );
    fn(data); // important
  });
}

testTalk();
