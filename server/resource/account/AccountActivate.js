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
      let accountKey = req.body.accountKey;
      let obj = {
        email: "test@dreamscale.io",
        message: "Torchie was successfully activated",
        status: "VALID"
      };

      Util.logPostRequest("POST", req, obj);

      res.send(obj);
    });
  }
};
