const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs"),
  events = require("events"),
  readline = require("readline"),
  path = require("path");

const Util = require("../Util");
const EventFactory = require("../events/EventFactory");
const {DtoClient} = require("./DtoClientFactory");
const WindowManagerHelper = require("./WindowManagerHelper");
const NewEditorActivityDto = require("../dto/NewEditorActivityDto");
const NewExternalActivityDto = require("../dto/NewExternalActivityDto");
const NewExecutionActivityDto = require("../dto/NewExecutionActivityDto");
const NewModificationActivityDto = require("../dto/NewModificationActivityDto");
const NewFlowBatchEventDto = require("../dto/NewFlowBatchEventDto");

/**
 * This class is used to publish the active.flow feeds for the plugins
 * @type {FeedManager}
 */
module.exports = class FeedManager {
  constructor() {
    this.name = "[FeedManager]";
  }

  static PUBLISH_QUEUE_FOLDER = "publish_queue";
  static ERRORS_FOLDER = "publish_error";
  static FLOW_EXTENSION = ".flow";

  static EditorActivity = "EditorActivity";
  static ExecutionActivity = "ExecutionActivity";
  static ModificationActivity = "ModificationActivity";
  static ExternalActivity = "ExternalActivity";
  static Event = "Event";

  /**
   * Read the lines from a batch file, and add elements to the batch
   * @param flowBatchObj
   * @param filePath
   * @returns {Promise<boolean>}
   */
  async asyncProcessLineByLine(flowBatchObj, filePath) {
    let lineError;
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        try {
          this.handleParseLine(flowBatchObj, line);
        } catch (err) {
          console.error("Unable to process line, "+err);
          lineError = err;
        }

      });

      await events.once(rl, 'close');
    } catch (err) {
      console.error("Unable to process file: " + err);
    }

    if (lineError) {
      return false;
    }
    return true;
  }

  /**
   * Handle parsing the lines from the flow batch files, and instantiating json objects
   * in the batch
   * @param flowBatchObj
   * @param line
   */
  handleParseLine(flowBatchObj, line) {

    let lineType = this.parseTypeFromLine(line);
    let json = this.parseJsonObjectFromLine(line);

    switch (lineType) {
      case FeedManager.EditorActivity:
        flowBatchObj.editorActivityList.push(json);
        break;
      case FeedManager.ExternalActivity:
        flowBatchObj.externalActivityList.push(json);
        break;
      case FeedManager.ExecutionActivity:
        flowBatchObj.executionActivityList.push(json);
        break;
      case FeedManager.ModificationActivity:
        flowBatchObj.modificationActivityList.push(json);
        break;
      case FeedManager.Event:
        flowBatchObj.eventList.push(json);
        break;
      default:
        break;
    }
  }

  createEmptyFlowBatch() {
    const flowBatch = {};
    flowBatch.timeSent = new Date();
    flowBatch.editorActivityList = [];
    flowBatch.externalActivityList = [];
    flowBatch.executionActivityList = [];
    flowBatch.modificationActivityList = [];
    flowBatch.eventList = [];

    return flowBatch;
  }


  parseTypeFromLine(line) {
    const type = line.substr(0, line.indexOf("="));
    return type;
  }

  parseJsonObjectFromLine(line) {
    const lineType = line.substr(0, line.indexOf("="));
    const jsonStr = line.substr(line.indexOf("=") + 1);

    switch (lineType) {
      case FeedManager.EditorActivity:
        return new NewEditorActivityDto(jsonStr);
      case FeedManager.ExternalActivity:
        return new NewExternalActivityDto(jsonStr);
      case FeedManager.ExecutionActivity:
        return new NewExecutionActivityDto(jsonStr);
      case FeedManager.ModificationActivity:
        return new NewModificationActivityDto(jsonStr);
      case FeedManager.Event:
        return new NewFlowBatchEventDto(jsonStr);
      default:
        throw new Error("Unable to parse unknown event type = "+lineType);
    }
  }


  /**
   * Move the active.flow file to the publishing feed
   * @param pluginId
   * @param callback when done
   */
  moveActiveFlowToPublishingQueue(pluginId, callback) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    const queueFolder = path.join(pluginFolder, FeedManager.PUBLISH_QUEUE_FOLDER);

    Util.createFolderIfDoesntExist(queueFolder, () => {
      this.publishFile(pluginFolder, queueFolder, () => {
        if (callback) {
          callback();
        }
      });
    });
  }



  /**
   * Move a file over to errors folder if it's not parsable
   * @param pluginId
   * @param srcFilePath
   * @param srcFileName
   * @param callback
   */
  errorOutFile(pluginId, srcFilePath, srcFileName, callback) {

    const errorsFolder = this.getErrorsFolder(pluginId);

    let newPath = path.join(errorsFolder, srcFileName)

    if (fs.existsSync(srcFilePath)) {
      fs.rename(srcFilePath, newPath, function (err) {
        if (err) throw err;
        console.log('[FeedManager] Moved errored out flow file to '+newPath);
        if (callback) {
          callback();
        }
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  /**
   * Publish an active file to the publishing queue
   * @param pluginFolder
   * @param queueFolder
   * @param callback
   */
  publishFile(pluginFolder, queueFolder, callback) {
    let oldPath = path.join(pluginFolder, "active.flow");
    let newPath = path.join(queueFolder, "batch_"+this.getTimeExtension()+FeedManager.FLOW_EXTENSION)

    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err;
        console.log('[FeedManager] Successfully committed file to '+newPath);
        if (callback) {
          callback();
        }
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  /**
   * Get the queue folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getQueueFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FeedManager.PUBLISH_QUEUE_FOLDER);
  }

  /**
   * Get the errors folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getErrorsFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FeedManager.ERRORS_FOLDER);
  }


  /**
   * Publish all the batches in the batch folder to the server
   * @param pluginId
   * @param callback
   */
  publishAllBatches(pluginId, callback) {
    const queueFolder = this.getQueueFolder(pluginId);

    this.findAllFilesInPublishQueue(pluginId, (batchFileList) => {
      batchFileList.forEach((file) => {
        const filePath = path.join(queueFolder, file);

        console.log("[FeedManager] Processing "+filePath);
        const flowBatchDto = this.createEmptyFlowBatch();

        this.asyncProcessLineByLine(flowBatchDto, filePath).then((successfulParse) => {
          console.log("[FeedManager] done reading " + filePath);
          if (successfulParse) {
              this.publishBatch(pluginId, flowBatchDto, filePath);
            } else {
              this.handleParseFailure(pluginId, filePath, file);
            }
          }
        );
      });
    });
  }

  /**
   * Publish a flow batch to the server and handle the response
   * @param pluginId
   * @param flowBatchDto
   * @param filePath
   */
  publishBatch(pluginId, flowBatchDto, filePath) {
    this.publishBatchToServer(flowBatchDto, (store) => {
      if (store.error) {
        this.handleFailedBatch(pluginId, filePath, store.error);
      } else {
        this.handleSuccessfulBatch(pluginId, filePath);
      }
    });
  }


  handleSuccessfulBatch(pluginId, filePath) {
    console.log("[FeedManager] Sent 1 batch successfully for "+pluginId);
    //
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err)
      }
      //published file removed from queue
    });
  }

  /**
   * Handle scenario when batch send fails
   * @param pluginId
   * @param file
   */
  handleFailedBatch(pluginId, file, error) {
    console.error("[FeedManager] Call to server failed: "+error);
    console.log("[FeedManager] Will retry on next loop");
  }

  /**
   * Handle a parsing error situation where we want to move the file out of the way
   * so the system stops choking on it.  Something is wrong with the file, possibly broke
   * with the plugin not properly meeting the spec
   * @param pluginId
   * @param filePath
   * @param file
   * @param callback
   */
  handleParseFailure(pluginId, filePath, file, callback) {
    console.error("[FeedManager] Failed to parse flow batch: "+filePath);

    let errorsFolder = this.getErrorsFolder(pluginId);

    Util.createFolderIfDoesntExist(errorsFolder, () => {
      this.errorOutFile(pluginId, filePath, file, () => {
        if (callback) {
          callback();
        }
      });
    });
  }

  /**
   * Publishes the data batch to the server
   * @param flowBatchDto
   * @param callback
   */
  publishBatchToServer(flowBatchDto, callback) {
    flowBatchDto.timeSent = new Date(); //update the timestamp to right now

    //console.debug(flowBatchDto); //useful but verbose
    this.doFlowBatchPublish(flowBatchDto, callback);
  }


  /**
   * Get a list of all the flow files in the plugin queue
   * @param pluginId
   * @param callback
   */
  findAllFilesInPublishQueue(pluginId, callback) {
    const queueFolder = this.getQueueFolder(pluginId);

    const batchFileList = [];
    fs.readdir(queueFolder, (err, files) => {
      files.forEach(file => {
        if (fs.statSync(queueFolder + "/" + file).isFile() && file.endsWith(FeedManager.FLOW_EXTENSION)){
          console.log("[FeedManager] batch file found: "+file);
          batchFileList.push( file );
        }
      });
      callback(batchFileList);
    });
  }


  /**
   * Get file extension for flow batch files based on a timestamp
   * @returns {string}
   */
  getTimeExtension() {
    let today = new Date().toJSON();
    today = today.replaceAll("-", "");
    today = today.replaceAll(":", "");

    return today.substr(0, today.indexOf('.'));
  }

  /**
   * Publish the flow batch to the server
   * @param flowBatchDto
   * @param callback
   *
   */
  doFlowBatchPublish(flowBatchDto, callback) {
    log.info("[FeedManager] do flow input batch publish");

    this.urn = "/flow/input/batch";

    this.callback = callback;
    this.store = {
      context: "FeedManager",
      dto: flowBatchDto,
      guid: Util.getGuid(),
      name: "FeedStore",
      requestType: "post",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug("[FeedManager] put flow input batch -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
