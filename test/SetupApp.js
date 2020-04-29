const chalk = require("chalk");

before(function() {
  console.log(
    chalk.bold.yellow("[TEST-APP]") + " global setup"
  );
});

after(function() {
  console.log(
    chalk.bold.yellow("[TEST-APP]") + " global teardown"
  );
});
