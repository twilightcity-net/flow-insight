const log = require("electron-log"),
  chalk = require("chalk"),
  request = require("superagent"),
  EventFactory = require("../events/EventFactory"),
  HeartbeatDto = require("../dto/HeartbeatDto"),
  SimpleStatusDto = require("../dto/SimpleStatusDto"),
  TalkController = require("../controllers/TalkController");

/**
 * Application class that manages our heartbeat
 * @type {AppHeartbeat}
 */
module.exports = class AppHeartbeat {
  /**
   * builds are heartbeat class and event
   */
  constructor() {
    this.name = "[AppHeartbeat]";
    log.info(this.name + " create heartbeat -> okay");
    this.intervalMs = 60000;
    this.timeout = {
      response: 20000,
      deadline: 30000
    };
    this.dto = new HeartbeatDto({
      idleTime: 0,
      deltaTime: 0
    });
    this.previousDeltaTime = 0;
    this.pingTime = 0;
    this.url = global.App.api + "/account/heartbeat";
    this.events = {
      heartbeat: EventFactory.createEvent(
        EventFactory.Types.APP_HEARTBEAT,
        this
      )
    };
  }

  /**
   * starts our heartbeat mechanism
   */
  start() {
    log.info(
      this.name +
        " start heartbeat -> interval : " +
        this.intervalMs
    );
    this.previousDeltaTime = new Date().getTime();
    this.pulse();
    this.interval = setInterval(() => {
      this.pulse();
    }, this.intervalMs);
  }

  /**
   * stops our heartbeat state machine
   */
  stop() {
    log.info(this.name + " stop heartbeat -> okay");
    clearTimeout(this.interval);
  }

  /**
   * fires a heartbeat pulse into the application system framework
   */
  pulse() {
    try {
      /// gets the calculated values for idle and delta time
      this.dto.idleTime = global.App.idleTime;
      this.dto.deltaTime =
        new Date().getTime() - this.previousDeltaTime;

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
        this.pingTime =
          new Date().getTime() - this.previousDeltaTime;
        log.info(
          chalk.greenBright(this.name) +
            " ping [" +
            this.pingTime +
            "ms]"
        );

        try {
          if (err) throw new Error(err);
          global.App.isOnline = true;
          dto = new SimpleStatusDto(res.body);
          dto.pingTime = this.pingTime;
          dto.latencyTime = global.App.TalkManager.getLatency();
          dto.isOnline = dto.isValid();
        } catch (e) {
          global.App.isOnline = false;
          dto = new SimpleStatusDto({
            message: e.toString(),
            status: "FAILED"
          });
          dto.pingTime = -1;
          dto.latencyTime = global.App.TalkManager.getLatency();
          dto.isOnline = global.App.isOnline;
        } finally {
          if (dto) {
            dto.server = global.App.api;
            dto.talkUrl = global.App.talkUrl;
            dto.isOnline = global.App.isOnline;
            this.events.heartbeat.dispatch(dto);
          }
        }
      });
    } catch (e) {
      log.error(
        chalk.red(this.name) +
          " " +
          e +
          "\n\n" +
          e.stack +
          "\n"
      );
    }
  }
};
