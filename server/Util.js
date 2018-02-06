const chalk = require("chalk");

module.exports = class Util {
  static logPostRequest(type, url, dtoReq, dtoRes) {
    if (!Util.shouldLog()) return;
    console.log(
      chalk.magenta("[API-DEV]") +
        " " +
        type +
        " -> " +
        url +
        " : REQ=" +
        JSON.stringify(dtoReq) +
        " : RES=" +
        JSON.stringify(dtoRes)
    );
  }

  static logError(e, type, url) {
    if (!Util.shouldLog()) return;
    console.log(
      chalk.magenta("[API-DEV]") +
        " " +
        chalk.bold.red("[ERROR]") +
        " " +
        type +
        " -> " +
        url +
        " : " +
        chalk.bold(e.message)
    );
  }

  static shouldLog() {
    let log = true;
    process.argv.forEach(function(val, index, array) {
      if (val.toLowerCase() === "env=test") {
        log = false;
      }
    });
    return log;
  }
};
