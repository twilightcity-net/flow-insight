const log = require("electron-log"),
  chalk = require("chalk"),
  EventFactory = require("../events/EventFactory");
const PluginManager = require("../managers/PluginManager");
const FeedManager = require("../managers/FeedManager");

/**
 * Application class that manages publishing our plugin flow data to the server
 * @type {AppFlowPublisher}
 */

module.exports = class AppFlowPublisher {
  /**
   * builds are flow publisher class and event
   */
  constructor() {
    this.name = "[AppFlowPublisher]";
    log.info(this.name + " create flow publisher -> okay");
    this.intervalMs = 60000 * 20;
    this.initialDelayMs = 20000;
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };
    this.url = global.App.api + "/flow/input/batch";
    this.events = {
      publishEvent: EventFactory.createEvent(
        EventFactory.Types.APP_FLOW_PUBLISH,
        this
      ),
    };

    this.pluginManager = new PluginManager();
    this.feedManager = new FeedManager();
  }

  /**
   * starts our flow publisher mechanism
   */
  start() {
    log.info(
      this.name +
        " start flow publisher -> interval : " +
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
   * stops our flow publisher state machine
   */
  stop() {
    log.info(this.name + " stop flow publisher -> okay");
    clearTimeout(this.interval);
  }

  /**
   * fires a publisher pulse that sends plugin data to gridtime
   */
  pulse() {
    log.info("[FlowPublisher] Flow publisher pulse starting...");

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
    this.pluginManager.loadAndValidatePlugins(() => {
      const plugins = this.pluginManager.getRegisteredPluginList();

      log.info("Plugins to process: "+plugins.length);

      plugins.forEach(pluginId => {
        this.feedManager.commitActiveFlowFile(pluginId, () => {
          this.feedManager.publishAllBatches(pluginId);
        });
      });

    });
  }

};
