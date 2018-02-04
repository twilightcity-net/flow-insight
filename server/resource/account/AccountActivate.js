const Util = require("../../Util");

module.exports = class AccountActivate {
  constructor(app, url) {
    // app.get(url, function(req, res) {
    // 	var user_id = req.param('id');
    // 	var token = req.param('token');
    // 	var geo = req.param('geo');
    // 	res.send(user_id + ' ' + token + ' ' + geo);
    // });
    app.post(url, function(req, res) {
      try {
        let dto = req.body;

        if (!dto.activateToken) {
          throw new Error("Missing dto property : activateToken");
        }

        let obj = {
          status: "VALID",
          message: "Your account has been successfully activated.",
          email: "kara@dreamscale.io",
          apiKey: "FASFD423fsfd32d2322d"
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
