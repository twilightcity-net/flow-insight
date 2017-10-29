const { App } = require("./App");

function main() {
  try {
    global.App = new App();
  } catch (error) {
    App.handleError(error, true);
  }
}

main();
