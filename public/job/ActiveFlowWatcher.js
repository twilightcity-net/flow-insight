const log = require("electron-log"),
  chalk = require("chalk");
const Util = require("../Util"),
  fs = require("fs"),
  events = require("events"),
  readline = require("readline"),
  path = require("path");
  const FlowFileReader = require("./FlowFileReader");


/**
 * Watches the active flow file and responds to any activity
 * @type {FlowStateTracker}
 */
module.exports = class ActiveFlowWatcher {
  constructor(flowStateTracker) {
    this.name = "[ActiveFlowWatcher]";

    this.flowStateTracker = flowStateTracker;

    this.watchers = new Map();
    this.flowFileReader = new FlowFileReader();
    this.lastTimestamp = null;
  }

  static ACTIVE_FLOW_FILE = "active.flow";

  static ModificationActivity = "ModificationActivity";
  static EditorActivity = "EditorActivity";

  /**
   * Add an active.flow file watcher for this plugin, if one doesn't already exist
   * Could be a newly registered plugin.  File can disappear, so need to take that
   * into account as well
   * @param pluginId
   */
  watchActiveFlow(pluginId) {
    log.debug("Watch active flow...");
    if (!this.watchers.get(pluginId)) {
      let watcher = this.createWatcher(pluginId);
      this.watchers.set(pluginId, watcher);

      watcher.startWatch();
    }
  }

  createWatcher(pluginId) {

    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);

    //this file gets renamed (moved to preprocess) then deleted after it's split into batches
    const activeFlowPath = path.join(pluginFolder, ActiveFlowWatcher.ACTIVE_FLOW_FILE);

    return new Watcher(pluginId, activeFlowPath, this.onFileChangeHandler);
  }

  onFileChangeHandler = (filePath) => {
    log.debug("[ActiveFlowWatcher] File change event");

    let data = {
      lastTimestamp: this.lastTimestamp,
      lastRecordEndTime: null
    }

    this.flowFileReader.asyncProcessFile(filePath, data, this.onFileLineHandler).then((successfulParse) => {
      if (successfulParse) {
        this.lastTimestamp = data.lastRecordEndTime;
      }
    });

  }

  onFileLineHandler = (data, lineType, json) => {
    data.lastRecordEndTime = Util.getDateFromUTCStr(json.endTime);
    if (data.lastTimestamp === null) {
      data.lastTimestamp = data.lastRecordEndTime;
      this.processNewEntry(lineType, json);
    } else if (data.lastRecordEndTime > data.lastTimestamp ) {
      this.processNewEntry(lineType, json);
    } else {
      //console.log("Skipping "+lineType);
    }
  }

  processNewEntry(lineType, json) {
    if (lineType === ActiveFlowWatcher.ModificationActivity) {
      log.debug("[ActiveFlowWatcher] Process: "+lineType + "="+JSON.stringify(json));
      this.flowStateTracker.processModificationActivity(json);
    } else if (lineType === ActiveFlowWatcher.EditorActivity) {
      log.debug("[ActiveFlowWatcher] Process: "+lineType + "="+JSON.stringify(json));
    }
  }

};

class Watcher {

  static MAX_RETRIES = 3;

  constructor(pluginId, activeFlowPath, onFileChangeHandler) {
    this.pluginId = pluginId;
    this.activeFlowPath = activeFlowPath;
    this.retries = 0;
    this.onFileChangeHandler = onFileChangeHandler;
  }

  startWatch() {
    if (this.checkExists()) {
      log.debug("[Watcher] Starting watcher for plugin "+this.pluginId);
      this.run();
    } else {
      log.debug("[Watcher] Skipping watcher active.flow doesnt exist for plugin "+this.pluginId);
      this.retries = 0;
      this.restartWatcher();
    }
  }

  run() {
    let fsWait = false;
    fs.watch(this.activeFlowPath, (event, filename) => {
      if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
          fsWait = false;
        }, 100);


        if (event === "rename") {
          log.debug(`[Watcher] ${filename} file event ${event}`);

          this.retries = 0;
          this.restartWatcher();
        } else if (event === "change") {
          this.processChange();
        }
      }
    });
  }

  processChange() {
    log.debug("[Watcher] Process file update for plugin "+this.pluginId+"!");
    this.onFileChangeHandler(this.activeFlowPath);
  }

  checkExists() {
    return fs.existsSync(this.activeFlowPath);
  }

  restartWatcher() {
    if (this.retries < Watcher.MAX_RETRIES) {
      setTimeout(() => {
        if (this.checkExists()) {
          log.debug("[Watcher] Restarting watcher for plugin "+this.pluginId+"...");
          this.run();
        } else {
          this.retries++;
          log.debug("[Watcher] Watcher for plugin "+this.pluginId+ " retrying in 5 seconds...");
          this.restartWatcher();
        }
      }, 5000);
    } else {
      log.debug("[Watcher] Watcher retry count exceeded for plugin "+this.pluginId);
    }
  }



}

