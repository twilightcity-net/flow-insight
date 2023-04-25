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
      response: 30000,
      deadline: 30000,
    };
    this.dto = new HeartbeatDto({
      idleTime: 0,
      deltaTime: 0,
    });
    this.previousDeltaTime = 0;
    this.pingTime = 0;
    this.url = global.App.api + "/account/heartbeat";
    this.events = {
      heartbeat: EventFactory.createEvent(
        EventFactory.Types.APP_HEARTBEAT,
        this
      ),
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

  createHeartbeatDto() {
    this.dto.deltaTime =
      new Date().getTime() - this.previousDeltaTime;
    this.dto.messageCounters = global.App.TalkManager.getMessageCounters();

    const flowData = global.App.FlowManager.getMyFlow();

    if (flowData) {
      this.dto.currentMomentum = flowData.momentum;
    }

    log.info(this.name + ": " + JSON.stringify(this.dto));

    return this.dto;
  }

  /**
   * fires a heartbeat pulse into the application system framework
   */
  pulse() {
    try {
      /// gets the calculated values for idle and delta time
      let sendDto = this.createHeartbeatDto();

      /// build our heartbeat request, no retries
      let req = request
        .post(this.url)
        .timeout(this.timeout)
        .send(sendDto)
        .set("Content-Type", "application/json")
        .set("X-API-Key", global.App.ApiKey);

      /// create memory for our response body
      let responseDto = new SimpleStatusDto({});

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

        if (!err) {
          global.App.isOnline = true;

          responseDto = new SimpleStatusDto(res.body);
          log.info(
            "HEARTBEAT STATUS: " + responseDto.status
          );

          responseDto.pingTime = this.pingTime;
          responseDto.latencyTime =
            global.App.TalkManager.getLatency();
        } else {
          global.App.isOnline = false;
          responseDto = new SimpleStatusDto({
            message: err.message,
            status: "FAILED",
          });
          responseDto.pingTime = -1;
          responseDto.latencyTime =
            global.App.TalkManager.getLatency();
          log.info("HEARTBEAT FAIL");
        }

        if (
          responseDto.status === "FAILED" ||
          responseDto.status === "REFRESH"
        ) {
          global.App.TalkManager.resetMessageCounters();
        } else {
          global.App.TalkManager.pruneMessageCounters();
        }

        responseDto.server = global.App.api;
        responseDto.talkUrl = global.App.talkUrl;
        responseDto.isOnline = global.App.isOnline;
        this.events.heartbeat.dispatch(responseDto);
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
