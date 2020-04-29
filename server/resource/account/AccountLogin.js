const Util = require("../../Util");
const SimpleStatusDto = require("../../../public/dto/SimpleStatusDto");

module.exports = class AccountLogin {
  constructor(app, url) {
    app.post(url, (req, res) => {
      try {
        this.checkForEmptyRequest(req);
        let apiKey = this.getApiKey(req);
        let dtoRes = new SimpleStatusDto({
          message: "Successfully logged in",
          status: "VALID"
        });
        // let dtoRes = new SimpleStatusDto({
        //   message: "Sorry unable to login into Torchie",
        //   status: "FAILED"
        // });

        Util.logPostRequest("POST", req.url, null, dtoRes);

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
    if (!apiKey)
      throw new Error(
        "Request requires header 'x-api-key'"
      );
    return apiKey;
  }

  checkForEmptyRequest(req) {
    if (!Util.isObjEmpty(req.body))
      throw new Error("Request does not accept post data");
  }
};
