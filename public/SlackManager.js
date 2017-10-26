const Util = require("./Util"),
  IncomingWebhook = require("@slack/client").IncomingWebhook,
  Notifier = require("node-notifier"),
  log = require("electron-log");

/*
 * This is a high level management class for Slack Integration. This
 * class uses the @mr.meeseeks bot to send messages to #metaos_buggery
 */

module.exports = class SlackManager {
  /*
   * called to initialize the manager
   */
  static init() {
    log.info("[SlackManager] Initialize");
    global.SlackManager = this;
    //this.test();
  }

  /*
   * test the service
   */
  static test() {
    this.sendBuggeryMessage(
      "I'm Mr. Meeseeks, look at me!!!",
      this.buggeryMessageCallback
    );
  }

  /*
   * Sends a message with @mr.meeseeks into #metaos_buggery
   */
  static sendBuggeryMessage(message, callback) {
    log.info("[SlackManager] send bug report -> #metaos_buggery");
    let url = this.getBuggeryURL();
    let webhook = new IncomingWebhook(url);
    webhook.send(message, callback);
  }

  static buggeryMessageCallback(err, header, statusCode, body) {
    if (err) {
      Notifier.notify(
        {
          title: "Bugged Out",
          message: "Unable to send bug report : " + err
        },
        function(err, response) {
          //TODO implement a fallback notification
        }
      );
      log.error(
        "[SlackManager] Unable to send bug report : " + response + " : " + err
      );
    } else {
      log.info("[SlackManager] responded with : " + statusCode);
      Notifier.notify(
        {
          title: "Bug Report Sent",
          message:
            "Your bug report been recieved by ninjas and wizards. We will contact you shortly!"
        },
        function(err, response) {
          //TODO implement a fallback notification
        }
      );
      log.info("[SlackManager] reported : " + body);
    }
  }

  /*
   * Assembles the webhook tokens and service url for slack see :
   * https://api.slack.com/apps/A7EHS2P7S/incoming-webhooks?error=access_denied&state=
   */
  static getBuggeryURL() {
    let tokens = [this.webhook, this.url];
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
    return urlStr + tokenStr;
  }

  /*
   * reads tokens into an array
   */
  static get webhook() {
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
  static get url() {
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
