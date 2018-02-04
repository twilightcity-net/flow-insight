const Util = require("../../Util");

module.exports = class AccountHeartbeat {
  constructor(app, url) {
    app.post(url, function(req, res) {
      try {
        let dto = req.body;

        if (!dto.idleTime) throw new Error("Missing dto property : idleTime");
        if (!dto.deltaTime) throw new Error("Missing dto property : deltaTime");

        let obj = {
          message: "Everything is awesome",
          status: "VALID"
        };

        Util.logPostRequest("POST", req, obj);

        res.send(obj);
      } catch (e) {
        Util.logError(e);
        res.statusCode = 400;
        res.send(e.message);
      }
    });
  }
};
