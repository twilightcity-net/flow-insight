const log = require("electron-log"),
  chalk = require("chalk");
const Util = require("../Util"),
  fs = require("fs"),
  path = require("path");;


/**
 * Handles commands from FlowInsight that instruct the IDE to do something, such as open a file
 * in the editor.  The communication between processes uses the file system.
 * @type {FervieActionRunner}
 */
module.exports = class FervieActionRunner {
  constructor() {
    this.name = "[FervieActionRunner]";
    this.lastEventDate = null;
    this.cmdEvents = [];
  }

  static FERVIE_ACTION_FILE = "fervie.action";
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
    if (this.lastEventDate === null || (now - this.lastEventDate) > FervieActionRunner.FIVE_MIN) {
      this.cmdEvents = [];
      this.lastEventDate = null;
    }
  }


  /**
   * Reset by deleting existing IDE action file
   */
  resetActionFile(actionFile, callback) {
    log.debug(this.name + " Resetting IDE action file: "+actionFile);
    fs.unlink(actionFile, (err) => {
      if (err) {
        //could be an error with the file just not being there when we're trying to delete, that's okay
        log.warn(this.name + "Error while deleting file: "+ err);
      }
      if (callback) {
        callback();
      }
    });
  }

  /**
   * Reset our IDE cmd file only if the data is stale
   * @param cmdFile
   * @param now
   * @param callback
   */
  resetActionFileIfNeeded(cmdFile, now, callback) {
    if (this.lastEventDate === null || (now - this.lastEventDate) > FervieActionRunner.FIVE_MIN ) {
      this.resetActionFile(cmdFile, callback);
    } else {
      callback();
    }
  }

  /**
   * Run an action within the IDE context by writing to that plugins action file
   * @param pluginId
   * @param extensionName
   * @param actionId
   */
  runAction(pluginId, extensionName, actionId) {
    log.debug(this.name + "Writing fervie.action to IDE = "+pluginId + ", action = "+actionId, "for extension = "+extensionName);

    const now = Util.getCurrentLocalTimeString();
    const runActionCmdLine = this.createRunActionCommandLine(extensionName, actionId, now);

    this.writeCmdToActionFile(pluginId, runActionCmdLine, now);
  }

  /**
   * Writes the supplied command line to the fervie.action file for the plugin
   * which will cause the action to run in the IDE context
   * @param pluginId
   * @param actionCmdLine
   * @param now
   */
  writeCmdToActionFile(pluginId, actionCmdLine, now) {
    const fervieActionFile = this.getFervieActionFileForPlugin(pluginId);
    this.resetActionFileIfNeeded(fervieActionFile, now, (err) => {
      if (!err) {
        log.debug("Writing action cmd line to file: "+actionCmdLine);
        this.appendLineToFile(fervieActionFile, actionCmdLine);
      } else {
        console.error("Unable to reset fervie action file: "+fervieActionFile);
      }
    });

    this.resetCmdTrackingIfNeeded(now);
    this.trackLatestCmd(actionCmdLine, now);
  }

  /**
   * Create the string that we print in the file to run actions within the IDE
   * @param extensionName
   * @param actionId
   * @param now
   * @returns {string}
   */
  createRunActionCommandLine(extensionName, actionId, now) {
    let actionJsonObj = {};
    actionJsonObj.actionId = actionId;
    actionJsonObj.extensionName = extensionName;
    actionJsonObj.position = now;

    return "RUN=" +JSON.stringify(actionJsonObj);
  }

  /**
   * Create the string that we print in the file to goto a file within the IDE
   * @param moduleName
   * @param filePath
   * @param now
   * @returns {string}
   */
  createGotoFileActionCommandLine(moduleName, filePath, now) {

    const actionJsonObj = {position: now, module: moduleName, filePath: filePath };
    return "GOTO="+JSON.stringify(actionJsonObj);
  }

  /**
   * Get the fervie.action file within the context of the IDE plugin supplied.
   * We could have fervie.actions that callback to Intellij, or callback to VSCode, for example,
   * all fervie actions that come from IDE plugin extensions, have an IDE that corresponds to the actionId.
   * @param pluginId
   */
  getFervieActionFileForPlugin(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const idePluginFolder = path.join(allPluginsFolder, pluginId);

    const actionsFolder = this.findOrCreateActionsFolder(idePluginFolder);

    return path.join(actionsFolder, FervieActionRunner.FERVIE_ACTION_FILE);
  }



  findOrCreateActionsFolder(idePluginFolder) {
    const actionsFolder = path.join(idePluginFolder, "actions");

    if (!fs.existsSync(actionsFolder)) {
      fs.mkdirSync(actionsFolder);
    }
    return actionsFolder;
  }


  /**
   * Append a GOTO command to the end of a file
   * @param moduleName
   * @param filePath
   */
  gotoFileCommand(moduleName, filePath) {
    let SUPPORTED_PLUGIN = "com.jetbrains.intellij";

    const now = Util.getCurrentLocalTimeString();
    const gotoFileActionCmdLine = this.createGotoFileActionCommandLine(moduleName, filePath, now);

    this.writeCmdToActionFile(SUPPORTED_PLUGIN, gotoFileActionCmdLine, now);
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

