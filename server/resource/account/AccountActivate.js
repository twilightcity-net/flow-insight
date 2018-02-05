const Util = require("../../Util");
const AccountActivationDto = require("../../../public/dto/AccountActivationDto");
const ActivationTokenModel = require("../../../public/model/ActivationTokenModel");

module.exports = class AccountActivate {
  constructor(app, url) {
    app.post(url, function(req, res) {
      try {
        /// request
        let json = req.body;
        let model = new ActivationTokenModel(json.activateToken);

        /// response
        let obj = {
          status: "VALID",
          message: "Your account has been successfully activated.",
          email: "kara@dreamscale.io",
          apiKey: "FASFD423fsfd32d2322d"
        };
        let dto = new AccountActivationDto(JSON.stringify(obj));

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
