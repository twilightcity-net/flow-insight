/*
 * main execution function for electron.. called first
 */
function main() {
  let App = require("./App");
  global.App = new App();
}

main();
