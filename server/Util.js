const chalk = require("chalk");

module.exports = class Util {
  static logPostRequest(type, request, response) {
    console.log(
      chalk.magenta("[API-DEV]") +
        " " +
        type +
        " -> " +
        request.url +
        " : BODY=" +
        JSON.stringify(request.body) +
        " : RESPONSE=" +
        JSON.stringify(response)
    );
  }

  static logError(e) {
    console.log(
      chalk.magenta("[API-DEV]") + chalk.red(" ERROR -> ") + e.message
    );
  }
};
