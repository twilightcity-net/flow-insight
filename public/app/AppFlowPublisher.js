const log = require("electron-log"),
  chalk = require("chalk"),
  request = require("superagent"),
  EventFactory = require("../events/EventFactory"),
  HeartbeatDto = require("../dto/HeartbeatDto"),
  SimpleStatusDto = require("../dto/SimpleStatusDto"),
  TalkController = require("../controllers/TalkController");

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
    this.timeout = {
      response: 30000,
      deadline: 30000,
    };
    this.url = global.App.api + "/flow/input/batch";
    this.events = {
      heartbeat: EventFactory.createEvent(
        EventFactory.Types.APP_FLOW_PUBLISH,
        this
      ),
    };
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
    this.pulse();
    this.interval = setInterval(() => {
      this.pulse();
    }, this.intervalMs);
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

    this.validatePluginRegistrations();

    //pair request button.

    //look at the .flow/plugins directory, and get a list of all the directories in there.
    //for each plugin folder, look for an active.flow file.
    // If there's no file, that's okay, shouldn't error out.  Maybe log a warning.

    //for each of the plugin directories, create a published/ directory.
    // When the data is being batched for publish, copy the contents of the active.flow file,
    //while it's temporarily locked, to prevent writes from the plugin.

    // Once we move the file, to the published/ batch of files... these are now documents
    // we need to successfully process, by sending them to the server.

    // however many files we have in here, we iterate over them all, and send them to the server.
    // on success, we delete the file.
    // on failure... we do nothing, and leave the files there for the next retry,
    // log any failures that happen.  Noting a possible reason is, we may be offline.
    // we may be offline for hours, and we just try every 20 minutes.

    // plugin registrations need to come back as part of the ConnectionStatusDto response object
    // we need an API for POST /account/plugin/registration on the server,
    // and the server gives back a key, which we write out to our settings.

    // if we've got a plugin violation, we still ought to send the data for all the registered
    // plugins... just skip the unregistered ones.

    // After we manually ask to register a plugin, then we need to query
    // GET /account/plugin/registration to get the new list of plugin registrations.

    //sends the plugin key with the batch.


    try {
      console.log("do stuff");
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

  validatePluginRegistrations() {

  }
};
