const Util = require("../../Util");
const ActivationCodeDto = require("../../../public/dto/ActivationCodeDto");
const AccountActivationDto = require("../../../public/dto/AccountActivationDto");

module.exports = class AccountActivate {
  constructor(app, url) {
    app.post(url, (req, res) => {
      try {
        let dtoReq = new ActivationCodeDto(req.body);
        let dtoRes = new AccountActivationDto({
          status: "VALID",
          message:
            "Your account has been successfully activated.",
          email: "kara@dreamscale.io",
          apiKey: "FASFD423fsfd32d2322d"
        });

        Util.logPostRequest(
          "POST",
          req.url,
          dtoReq,
          dtoRes
        );

        res.send(dtoRes);
      } catch (e) {
        Util.logError(e, "POST", req.url);
        res.statusCode = 400;
        res.send(e.message);
      }
    });
  }
};
