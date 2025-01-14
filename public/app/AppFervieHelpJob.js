const log = require("electron-log"),
  chalk = require("chalk"),
  EventFactory = require("../events/EventFactory");
const AppConfig = require("./AppConfig");
const FervieHelpRequestor = require("../job/FervieHelpRequestor");
/**
 * Application class that detects when we need help and triggers fervie support
 * @type {AppFervieHelpJob}
 */

module.exports = class AppFervieHelpJob {
  /**
   * builds are fervie help detection loop
   */
  constructor() {
    this.name = "[AppFervieHelpJob]";
    log.info(this.name + " create fervie help -> okay");
    this.intervalMs = 60000;
    this.initialDelayMs = 40000;
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };
    this.url = global.App.api + "/fervie/help";
    this.events = {
    };

    this.fervieHelpRequestor = new FervieHelpRequestor();
  }

  /**
   * starts our fervie help mechanism
   */
  start() {
    if (AppConfig.isMoovieApp()) {
      return;
    }

    log.info(
      this.name +
        " start fervie help -> interval : " +
        this.intervalMs
    );
    setTimeout(() => {
      this.pulse();
      this.interval = setInterval(() => {
        this.pulse();
      }, this.intervalMs);
    }, this.initialDelayMs);

  }

  /**
   * stops our fervie help state machine
   */
  stop() {
    log.info(this.name + " stop fervie help -> okay");
    clearTimeout(this.interval);
  }

  /**
   * fires a fervie help pulse that checks if we need help
   */
  pulse() {
    log.info(this.name +" Fervie help pulse starting...");

    try {
      this.doLoopProcessing();
    } catch (e) {
      log.error(
        chalk.red(this.name) +
          " " +
          e +
          "\n\n" +
          e.stack +
          "\n"
      );
    }
  }

  doLoopProcessing() {
    this.fervieHelpRequestor.triggerFervieOnTroubleThreshold();
  }

};
