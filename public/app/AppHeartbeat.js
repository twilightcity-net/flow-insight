const log = require("electron-log"),
  chalk = require("chalk"),
  request = require("superagent"),
  HeartbeatDto = require("../dto/HeartbeatDto");

//
// Application class that manages our heartbeat
//
module.exports = class AppHeartbeat {
  constructor() {
    log.info("[AppHeartbeat] create heartbeat -> okay");
    this.intervalMs = 10000;
    this.timeout = {
      response: 6000,
      deadline: 9000
    };
    this.dto = new HeartbeatDto({
      idleTime: 0,
      deltaTime: 0
    });
    this.previousDeltaTime = 0;
    this.pingTime = 0;
    this.url = global.App.api + "/account/heartbeat";
  }

  start() {
    log.info("[AppHeartbeat] start heartbeat -> interval : " + this.intervalMs);
    this.previousDeltaTime = new Date().getTime();
    this.interval = setInterval(() => {
      this.pulse();
    }, this.intervalMs);
  }

  stop() {
    log.info("[AppHeartbeat] stop heartbeat -> okay");
    clearTimeout(this.interval);
  }

  pulse() {
    try {
      /// gets the calculated values for idle and delta time
      this.dto.idleTime = global.App.idleTime;
      this.dto.deltaTime = new Date().getTime() - this.previousDeltaTime;

      log.info(
        chalk.green("[AppHeartbeat]") +
          " pulse -> iMs:" +
          this.dto.idleTime +
          " | dMs:" +
          this.dto.deltaTime
      );

      /// build our heartbeat request, no retries
      let req = request
        .post(this.url)
        .timeout(this.timeout)
        .send(this.dto)
        .set("Content-Type", "application/json")
        .set("X-API-Key", global.App.ApiKey);

      /// store the current time to calculate our ping
      this.previousDeltaTime = new Date().getTime();

      /// perform our request
      req.end((err, res) => {
        this.pingTime = new Date().getTime() - this.previousDeltaTime;
        log.info(
          chalk.green("[AppHeartbeat]") +
            " └> pulse complete ->  ping:" +
            this.pingTime
        );

        try {
          if (err) throw new Error(err);

          // console.log(res.body);
        } catch (e) {
          console.log(">>>>>>>>>>heartbeat failed");
          console.log(e);
        }
      });
    } catch (e) {
      log.error(
        chalk.blue("[AppHeartbeat]") + " " + e + "\n\n" + e.stack + "\n"
      );
    }
  }
};
