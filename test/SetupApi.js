const chalk = require("chalk");

before(function () {
  console.log(
    chalk.bold.yellow("[TEST-API]") + " global setup"
  );
  const server = require("../server/Server");
});

after(function () {
  console.log(
    chalk.bold.yellow("[TEST-API]") + " global teardown"
  );
});
