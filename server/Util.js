const chalk = require("chalk");

module.exports = class Util {
  static logPostRequest(type, request, response) {
    console.log(
      chalk.magenta("[API-DEV]") +
        " " +
        type +
        " -> " +
        request.url +
        " : REQ=" +
        JSON.stringify(request.body) +
        " : RES=" +
        JSON.stringify(response)
    );
  }

  static logError(e) {
    console.log(
      chalk.magenta("[API-DEV]") +
        " " +
        chalk.bold.red("ERROR ->") +
        " " +
        chalk.bold(e.message)
    );
  }
};
