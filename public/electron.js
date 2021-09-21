const App = require("./app/App");

function main() {
  try {
    global.App = new App();
  } catch (error) {
    App.handleError(error, true);
  }
}

main();
