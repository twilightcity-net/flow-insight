const Util = require("../../Util");
const HeartbeatDto = require("../../../public/dto/HeartbeatDto");
const SimpleStatusDto = require("../../../public/dto/SimpleStatusDto");

module.exports = class AccountHeartbeat {
  constructor(app, url) {
    app.post(url, (req, res) => {
      try {
        let apiKey = this.getApiKey(req);
        let dtoReq = new HeartbeatDto(req.body);
        let dtoRes = new SimpleStatusDto({
          message: "Everything is awesome",
          status: "VALID"
        });

        Util.logPostRequest("POST", req.url, dtoReq, dtoRes);

        res.send(dtoRes);
      } catch (e) {
        Util.logError(e, "POST", req.url);
        res.statusCode = 400;
        res.send(e.message);
      }
    });
  }

  getApiKey(request) {
    let apiKey = request.headers["x-api-key"];
    if (!apiKey) throw new Error("Request requires header 'x-api-key'");
    return apiKey;
  }
};
