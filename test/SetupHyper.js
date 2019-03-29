const chalk = require("chalk");

before(function() {
  console.log(chalk.bold.yellow("[TEST-HYPER]") + " global setup");
});

after(function() {
  console.log(chalk.bold.yellow("[TEST-HYPER]") + " global teardown");
});
