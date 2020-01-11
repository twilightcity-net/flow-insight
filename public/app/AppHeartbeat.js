const log = require("electron-log"),
  chalk = require("chalk"),
  request = require("superagent"),
  EventFactory = require("../events/EventFactory"),
  HeartbeatDto = require("../dto/HeartbeatDto"),
  SimpleStatusDto = require("../dto/SimpleStatusDto");

//
// Application class that manages our heartbeat
//
module.exports = class AppHeartbeat {
  constructor() {
    log.info("[AppHeartbeat] create heartbeat -> okay");
    this.intervalMs = 60000;
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
    this.events = {
      heartbeat: EventFactory.createEvent(
        EventFactory.Types.APP_HEARTBEAT,
        this
      )
    };
  }

  start() {
    log.info("[AppHeartbeat] start heartbeat -> interval : " + this.intervalMs);
    this.previousDeltaTime = new Date().getTime();
    this.pulse();
    this.interval = setInterval(() => {
      this.pulse();
    }, this.intervalMs);

    ////
    //// TESTING : TalkToClient
    ////
    // global.App.TalkManager.getAllTalkMessagesFromRoom("angry_teachers");
    // global.App.TalkManager.publishChatToRoom(
    //   false,
    //   "angry_teachers",
    //   "hello from torchie client"
    // );
    // global.App.TalkManager.publishSnippetToRoom(
    //   false,
    //   "angry_teachers",
    //   "test comment",
    //   "edit_file",
    //   "432",
    //   "~/.bash_history",
    //   "export=null"
    // );
    // global.App.TalkManager.publishScreenshotToRoom(
    //   false,
    //   "angry_teachers",
    //   ".bash_history",
    //   "~/.bash_history"
    // );
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
          chalk.yellowBright("[AppHeartbeat]") +
            " ping [" +
            this.pingTime +
            "ms]"
        );

        try {
          if (err) throw new Error(err);
          global.App.isOnline = true;
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
          if (dto) {
            dto.server = global.App.api;
            dto.isOnline = global.App.isOnline;
            this.events.heartbeat.dispatch(dto);
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
