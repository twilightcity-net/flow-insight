const chalk = require("chalk"),
  express = require("express"),
  bodyParser = require("body-parser"),
  AccountActivate = require("./resource/account/AccountActivate"),
  AccountHeartbeat = require("./resource/account/AccountHeartbeat"),
  AccountLogin = require("./resource/account/AccountLogin"),
  AccountLogout = require("./resource/account/AccountLogout");

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
    this.express.use(
      bodyParser.urlencoded({ extended: true })
    );
    this.resources = {
      account: {
        activate: new AccountActivate(
          this.express,
          "/account/activate"
        ),
        heartbeat: new AccountHeartbeat(
          this.express,
          "/account/heartbeat"
        ),
        login: new AccountLogin(
          this.express,
          "/account/login"
        ),
        logout: new AccountLogout(
          this.express,
          "/account/logout"
        ),
      },
    };
    this.express.listen(this.port);
  }
});

function start() {
  let server = new Server();
}

start();
