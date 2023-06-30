const log = require("electron-log"),
  chalk = require("chalk");
const Util = require("../Util"),
  fs = require("fs"),
  path = require("path");
  const FlowFileReader = require("./FlowFileReader");


/**
 * Handles commands from FlowInsight that instruct the IDE to do something, such as open a file
 * in the editor.  The communication between processes uses the file system.
 * @type {IdeCommandProcessor}
 */
module.exports = class IdeCommandProcessor {
  constructor() {
    this.name = "[IdeCommandProcessor]";
    this.lastEventDate = null;
    this.cmdEvents = [];
  }

  static IDE_CMD_FILE = "active.cmd";
  static FIVE_MIN = 1000 * 60;

  /**
   * Track the latest cmd in memory and set the latest timestamp
   * @param cmdLine
   * @param now
   */
  trackLatestCmd(cmdLine, now) {
    this.lastEventDate = now;
    this.cmdEvents.push(cmdLine);
  }

  /**
   * Reset our memory state if the data is stale
   * @param now
   */
  resetCmdTrackingIfNeeded(now) {
    if (this.lastEventDate === null || (now - this.lastEventDate) > IdeCommandProcessor.FIVE_MIN) {
      this.cmdEvents = [];
      this.lastEventDate = null;
    }
  }


  /**
   * Reset by deleting existing IDE command file
   */
  resetIdeCmdFile(cmdFile, callback) {
    log.debug(this.name + " Deleting stale file: "+cmdFile);
    fs.unlink(cmdFile, (err) => {
      if (err) {
        log.error(this.name + err);
      }
      if (callback) {
        callback(err);
      }
    });
  }


  /**
   * Reset our IDE cmd file only if the data is stale
   * @param cmdFile
   * @param now
   * @param callback
   */
  resetCmdFileIfNeeded(cmdFile, now, callback) {
    if (this.lastEventDate === null || (now - this.lastEventDate) > IdeCommandProcessor.FIVE_MIN ) {
      this.resetIdeCmdFile(cmdFile, callback);
    } else {
      callback();
    }
  }





  /**
   * Append a GOTO command to the end of a file
   * @param moduleName
   * @param filePath
   */
  writeGotoFileCommand(moduleName, filePath) {

    const now = new Date();

    const idePluginFolders = global.App.PluginRegistrationHandler.getRegisteredIdePluginFolders();
    const jsonObj={position: Util.getCurrentLocalTimeString(), module: moduleName, filePath: filePath };
    const line = "GOTO="+JSON.stringify(jsonObj);

    idePluginFolders.forEach((pluginFolder) => {
      let cmdFile = path.join(pluginFolder, IdeCommandProcessor.IDE_CMD_FILE);
      this.resetCmdFileIfNeeded(cmdFile, now, (err) => {
        if (!err) {
          this.appendLineToFile(cmdFile, line);
        } else {
          console.error("Unable to reset cmd file: "+cmdFile);
        }
      });
    });

    this.resetCmdTrackingIfNeeded(now);
    this.trackLatestCmd(line, now);

  }

  /**
   * Append a cmd line entry to the active cmd file
   * @param file
   * @param line
   */
  appendLineToFile(file, line) {
    let batchFileLogger = fs.createWriteStream(file, {
      flags: 'a' // 'a' means appending (old data will be preserved)
    });

    batchFileLogger.write(line + '\n');
    batchFileLogger.end();
  }


}

