const { App } = require("./App");

function main() {
  try {
    global.App = new App();
  } catch (error) {
    error.fatal = true;
    App.handleError(error);
  }
}

main();
