const log = require("electron-log"),
  chalk = require("chalk"),
  EventFactory = require("../events/EventFactory");
const FlowFeedProcessor = require("../job/FlowFeedProcessor");
const AppFeatureToggle = require("./AppFeatureToggle");

/**
 * Application class that manages publishing our plugin flow data to the server
 * @type {AppFlowPublisherJob}
 */

module.exports = class AppFlowPublisherJob {
  /**
   * builds are flow publisher class and event
   */
  constructor() {
    this.name = "[AppFlowPublisherJob]";
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

    this.pluginRegistrationHandler = global.App.PluginRegistrationHandler;
    this.codeModuleConfigHandler = global.App.CodeModuleConfigHandler;
    this.flowFeedProcessor = new FlowFeedProcessor();
  }

  /**
   * starts our flow publisher mechanism
   */
  start() {
    if (AppFeatureToggle.isMoovieApp) {
      return;
    }

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
    log.info("[AppFlowPublisher] Flow publisher pulse starting...");

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
    this.pluginRegistrationHandler.loadAndValidatePlugins(() => {
      const plugins = this.pluginRegistrationHandler.getRegisteredPluginList();

      log.info(this.name + " Plugins to process: "+plugins.length);

      this.codeModuleConfigHandler.consolidatePluginConfigurations(plugins, () => {
        log.debug(this.name + " Plugin configs consolidated!");
        this.codeModuleConfigHandler.loadConfiguredModulesList(() => {
          log.debug(this.name + " Done loading configured module list from the server!");
          this.codeModuleConfigHandler.tryToLoadConfigsWhenModuleNotConfigured(() => {
            log.debug(this.name + " Done loading flowinsight-config.json files from projects!");
          });

        });
      });

      plugins.forEach(pluginId => {
        this.flowFeedProcessor.deleteOldArchiveFiles(pluginId, () => {
          this.flowFeedProcessor.cleanupOldPreprocessingState(pluginId, () => {
            this.flowFeedProcessor.commitActiveFlowFile(pluginId, () => {
              this.flowFeedProcessor.publishAllBatches(pluginId);
            });
          });
        });

      });

    });
  }

};
