const log = require("electron-log"),
  chalk = require("chalk"),
  request = require("superagent"),
  HeartbeatDto = require("../dto/HeartbeatDto"),
  SimpleStatusDto = require("../dto/SimpleStatusDto");

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

      /// create memory for our response body
      let dto = new SimpleStatusDto({});

      /// store the current time to calculate our ping
      this.previousDeltaTime = new Date().getTime();

      /// perform our request
      req.end((err, res) => {
        this.pingTime = new Date().getTime() - this.previousDeltaTime;
        log.info(
          chalk.green("[AppHeartbeat]") +
            " └> pulse complete ->  ping:" +
            this.pingTime +
            "ms"
        );

        try {
          if (err) throw new Error(err);
          dto = new SimpleStatusDto(res.body);
          dto.pingTime = this.pingTime;
          dto.isOnline = dto.isValid();
        } catch (e) {
          global.App.isOnline = false;
          dto = new SimpleStatusDto({
            message: e.toString(),
            status: "FAILED"
          });
          dto.pingTime = -1;
          dto.isOnline = global.App.isOnline;
        } finally {
          /// TODO fire event with dto in it
          if (dto) {
            dto.server = global.App.api;
            dto.isOnline = global.App.isOnline;
            console.log(dto);
          }
        }
      });
    } catch (e) {
      log.error(
        chalk.red("[AppHeartbeat]") + " " + e + "\n\n" + e.stack + "\n"
      );
    }
  }
};
