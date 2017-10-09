const Util = require("./Util");
const IncomingWebhook = require("@slack/client").IncomingWebhook;

/*
 * This is a high level management class for Slack Integration. This
 * class uses the @mr.meeseeks bot to send messages to #metaos_buggery
 */

module.exports = class SlackManager {
  static test() {
    console.log("testing SlackManager");
    let url = this.getWebhookURL();
    console.log("slack webhook -> " + url);
    let webhook = new IncomingWebhook(url);
    webhook.send("I'm Mr. Meeseeks, look at me!!!", function(
      err,
      header,
      statusCode,
      body
    ) {
      if (err) {
        console.log("Error:", err);
      } else {
        console.log("Received", statusCode, "from Slack");
      }
    });
  }

  /*
   * Assembles the webhook tokens and service url for slack see :
   * https://api.slack.com/apps/A7EHS2P7S/incoming-webhooks?error=access_denied&state=
   */
  static getWebhookURL() {
    let tokens = [this.webhookTokens, this.urlTokens];
    let tokenStr = "",
      urlStr = "";
    for (var i = 0; i < tokens[0].length; i++) {
      tokenStr += tokens[0][i].join("");
      if (i !== tokens[0].length - 1) {
        tokenStr += "/";
      }
    }
    for (var j = 0; j < tokens[1].length; j++) {
      urlStr += tokens[1][j];
      if (j === 0) urlStr += "://";
      else if (j === 1 || j === 2) urlStr += ".";
      else if (j === 3 || j === 4) urlStr += "/";
    }
    console.log(urlStr);
    return urlStr + tokenStr;
  }

  /*
   * reads tokens into an array
   */
  static get webhookTokens() {
    let tokenArr = [
      Util.tokenI.reverse(),
      Util.tokenH.reverse(),
      Util.tokenG.reverse()
    ];
    let salt = Util.tokenF.reverse();
    let salted = tokenArr[2].concat(salt);
    tokenArr[2] = salted;
    return tokenArr;
  }

  /*
   * creates url tokens into an array
   */
  static get urlTokens() {
    let urlArr = [
      Util.tokenA,
      Util.tokenB,
      Util.tokenC,
      Util.tokenD,
      Util.tokenE
    ];
    for (var i = 0; i < urlArr.length; i++) {
      urlArr[i] = urlArr[i].join("");
      urlArr[i] = Buffer.from(urlArr[i], "base64");
      urlArr[i] = urlArr[i].toString("ascii");
    }
    return urlArr;
  }
};
