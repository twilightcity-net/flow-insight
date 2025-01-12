const log = require("electron-log"),
  chalk = require("chalk"),
  EventFactory = require("../events/EventFactory");
const FlowFeedProcessor = require("../job/FlowFeedProcessor");
const FlowStateTracker = require("../job/FlowStateTracker");
const ActiveFlowWatcher = require("../job/ActiveFlowWatcher");
const FervieActionConfigHandler = require("../job/FervieActionConfigHandler");
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
    this.intervalMs = 60000 * 10;
    this.initialDelayMs = 20000;
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };

    this.pluginRegistrationHandler = global.App.PluginRegistrationHandler;
    this.codeModuleConfigHandler = global.App.CodeModuleConfigHandler;
    this.fervieActionConfigHandler = global.App.FervieActionConfigHandler;
    this.flowStateTracker = global.App.FlowStateTracker;

    this.activeFlowWatcher = new ActiveFlowWatcher(this.flowStateTracker);
    this.flowFeedProcessor = new FlowFeedProcessor(this.flowStateTracker);

  }

  /**
   * starts our flow publisher mechanism
   */
  start() {
    if (AppFeatureToggle.isMoovieApp()) {
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

    this.flowStateTracker.refresh();

    //gives a chance for the initial flow state context to finish
    setTimeout(() => {
      this.loadDataForPlugins();
    }, 1000);
  }

  loadDataForPlugins() {
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

      this.fervieActionConfigHandler.consolidateFervieActionConfigurations(plugins, () => {
        log.debug(this.name + " Fervie action configs consolidated!");
      });

      plugins.forEach(pluginId => {
        this.flowFeedProcessor.deleteOldArchiveFiles(pluginId, () => {
          this.flowFeedProcessor.cleanupOldPreprocessingState(pluginId, () => {
            this.flowFeedProcessor.commitActiveFlowFile(pluginId, () => {
              this.flowFeedProcessor.publishAllBatches(pluginId);
            });
          });
        });

        //start watchers after the first batch processes
        setTimeout(() => {
          this.activeFlowWatcher.watchActiveFlow(pluginId);
        }, 1000);

      });

    });
  }

};
