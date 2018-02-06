const chalk = require("chalk");
const express = require("express");
const bodyParser = require("body-parser");
const AccountActivate = require("./resource/account/AccountActivate");
const AccountHeartbeat = require("./resource/account/AccountHeartbeat");
const AccountLogin = require("./resource/account/AccountLogin");
const AccountLogout = require("./resource/account/AccountLogout");

const Server = (module.exports = class Server {
  constructor() {
    this.port = process.env.PORT || 5000;
    console.log(
      chalk.blue("Creating development server : ") +
        "http://localhost:" +
        this.port
    );
    this.express = express();
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.resources = {
      account: {
        activate: new AccountActivate(this.express, "/account/activate"),
        heartbeat: new AccountHeartbeat(this.express, "/account/heartbeat"),
        login: new AccountLogin(this.express, "/account/login"),
        logout: new AccountLogout(this.express, "/account/logout")
      }
    };
    this.express.listen(this.port);
  }
});

function start() {
  let server = new Server();
}

start();
