const chalk = require("chalk");

module.exports = class Util {
  static logPostRequest(type, url, dtoReq, dtoRes) {
    if (process.env.ENV === "test") return;
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
    if (process.env.ENV === "test") return;
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
};
