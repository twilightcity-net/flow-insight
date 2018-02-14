const log = require("electron-log"),
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

  // pulse() {
  //   this.dto.idleTime = global.App.idleTime;
  //   this.dto.deltaTime = new Date().getTime() - this.previousDeltaTime;

  //   // log.info("[AppHeartbeat] pulse -> iMs:" + this.dto.idleTime + " | dMs:" + this.dto.deltaTime);

  //   console.log(this.dto);

  //   this.previousDeltaTime = new Date().getTime();

  //   let req = request
  //     .post(url)
  //     .timeout(this.timeout)
  //     .send(dto)
  //     .set("Content-Type", "application/json")
  //     .req.set("X-API-Key", global.App.ApiKey);

  //   req.end((err, res) => {
  //     log.info("[AppHeartbeat] |> request complete -> " + url);
  //     this.store.timestamp = new Date().getTime();
  //     try {
  //       if (err) throw new Error(err);
  //       this.store.data = res.body;
  //     } catch (e) {
  //       this.store.error = e.toString();
  //       log.error(
  //         "[DataStoreClient] |> Connection Error -> " +
  //           this.type +
  //           " " +
  //           url +
  //           " : " +
  //           err +
  //           "\n\n" +
  //           err.stack +
  //           "\n"
  //       );
  //     } finally {
  //       log.info("[DataStoreClient] └> dispatch request callback -> " + url);
  //       this.callback(this.store);
  //     }
  //   });
  // }
};
