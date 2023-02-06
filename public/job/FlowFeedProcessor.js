const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs"),
  events = require("events"),
  readline = require("readline"),
  path = require("path");

const Util = require("../Util");
const {DtoClient} = require("../managers/DtoClientFactory");
const NewEditorActivityDto = require("../dto/NewEditorActivityDto");
const NewExternalActivityDto = require("../dto/NewExternalActivityDto");
const NewExecutionActivityDto = require("../dto/NewExecutionActivityDto");
const NewModificationActivityDto = require("../dto/NewModificationActivityDto");
const NewFlowBatchEventDto = require("../dto/NewFlowBatchEventDto");

/**
 * This class is used to publish the active.flow feeds for the plugins
 * @type {FlowFeedProcessor}
 */
module.exports = class FlowFeedProcessor {
  constructor() {
    this.name = "[FlowFeedProcessor]";
  }

  static PREPROCESS_FOLDER = "preprocess";
  static ARCHIVE_FOLDER = "archive";
  static PUBLISH_QUEUE_FOLDER = "publish_queue";
  static ERRORS_FOLDER = "publish_error";
  static FLOW_EXTENSION = ".flow";
  static BATCH_PREFIX = "batch_";
  static ACTIVE_FLOW_FILE = "active.flow";

  static EditorActivity = "EditorActivity";
  static ExecutionActivity = "ExecutionActivity";
  static ModificationActivity = "ModificationActivity";
  static ExternalActivity = "ExternalActivity";
  static Event = "Event";

  static BATCH_SIZE_LIMIT = 500;

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
          log.error("[FlowFeedProcessor] Unable to process line, "+err);
          lineError = err;
        }

      });

      await events.once(rl, 'close');
    } catch (err) {
      log.error("[FlowFeedProcessor] Unable to process file: " + err);
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
      case FlowFeedProcessor.EditorActivity:
        flowBatchObj.editorActivityList.push(json);
        break;
      case FlowFeedProcessor.ExternalActivity:
        flowBatchObj.externalActivityList.push(json);
        break;
      case FlowFeedProcessor.ExecutionActivity:
        flowBatchObj.executionActivityList.push(json);
        break;
      case FlowFeedProcessor.ModificationActivity:
        flowBatchObj.modificationActivityList.push(json);
        break;
      case FlowFeedProcessor.Event:
        flowBatchObj.eventList.push(json);
        break;
      default:
        break;
    }
  }

  createEmptyFlowBatch() {
    const flowBatch = {};
    flowBatch.timeSent = Util.getCurrentLocalTimeString();
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
      case FlowFeedProcessor.EditorActivity:
        return new NewEditorActivityDto(jsonStr);
      case FlowFeedProcessor.ExternalActivity:
        return new NewExternalActivityDto(jsonStr);
      case FlowFeedProcessor.ExecutionActivity:
        return new NewExecutionActivityDto(jsonStr);
      case FlowFeedProcessor.ModificationActivity:
        return new NewModificationActivityDto(jsonStr);
      case FlowFeedProcessor.Event:
        return new NewFlowBatchEventDto(jsonStr);
      default:
        throw new Error("Unable to parse unknown event type = "+lineType);
    }
  }

  /**
   * If the app crashed and left a bunch of half-done preprocessing in the directory
   * we need to clean it up before continuing.
   * @param pluginId
   * @param callback
   */
  cleanupOldPreprocessingState(pluginId, callback) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    const preprocessFolder = path.join(pluginFolder, FlowFeedProcessor.PREPROCESS_FOLDER);

    Util.createFolderIfDoesntExist(preprocessFolder, () => {
      const preprocessedFlowFile = path.join(preprocessFolder, FlowFeedProcessor.ACTIVE_FLOW_FILE);
      if (fs.existsSync(preprocessedFlowFile)) {
        log.info(this.name + " Reprocessing active.flow after last preprocess run crashed.");
        this.reprocessPreprocessing(pluginId, preprocessFolder, preprocessedFlowFile, () => {
          if (callback) {
            callback();
          }
        });
      } else if (this.folderIsNotEmpty(preprocessFolder)) {
        log.info(this.name +" Reprocessing old flow batches after last preprocess run crashed.");
        this.moveAllSplitBatchesToPublishQueue(pluginId, preprocessFolder, () => {
          if (callback) {
            callback();
          }
        });
      } else {
        if (callback) {
          callback();
        }
      }
    });
  }

  /**
   * Test whether there is contents in the folder
   * @param folder
   * @returns {boolean}
   */
  folderIsNotEmpty(folder) {
    let files = fs.readdirSync(folder);
    return files.length > 0;
  }

  /**
   * The preprocess folder didn't complete on the last run.  Clean up the old preprocess batch
   * files and then regenerate them using the active flow file, then call the callback when done
   * @param pluginId
   * @param preprocessFolder
   * @param preprocessFlowFile
   * @param callback
   */
  reprocessPreprocessing(pluginId, preprocessFolder, preprocessFlowFile, callback) {
    this.findAllBatchFilesInPreprocessing(preprocessFolder, (batchFiles) => {
      batchFiles.forEach((fileName) => {
        const batchFilePath = path.join(preprocessFolder, fileName);
        this.deleteFile(batchFilePath);
      });

      this.splitPreprocessFileAndMoveToPublishQueue(pluginId, preprocessFolder, preprocessFlowFile, () => {
        if (callback) {
          callback();
        }
      });
    });

  }

  /**
   * Move the active.flow file to the preprocessing folder,
   * then handle splitting it as necessary, then move to the publish_queue
   * @param pluginId
   * @param callback when done
   */
  commitActiveFlowFile(pluginId, callback) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    const preprocessFolder = path.join(pluginFolder, FlowFeedProcessor.PREPROCESS_FOLDER);

    Util.createFolderIfDoesntExist(preprocessFolder, () => {
      this.preprocessFile(pluginFolder, preprocessFolder, (preprocessFilePath) => {
        this.splitPreprocessFileAndMoveToPublishQueue(pluginId, preprocessFolder, preprocessFilePath, () => {
          if (callback) {
            callback();
          }
        });
      });
    });
  }

  /**
   * Sometimes active.flow files can be really big and need to be broken up into smaller
   * batch files before being processed and sent to the server.
   * This function splits up the active.flow file in the preprocess directory into a bunch of
   * small batch files, then moves them all over to publish queue.
   * @param pluginId
   * @param preprocessFolder
   * @param preprocessFilePath
   * @param callback
   */
  splitPreprocessFileAndMoveToPublishQueue(pluginId, preprocessFolder, preprocessFilePath, callback) {
    if (fs.existsSync(preprocessFilePath)) {
      log.debug(this.name + " Splitting up active.flow into batches");
      this.asyncSplitFile(preprocessFolder, preprocessFilePath).then(() => {
        this.deletePreprocessInput(preprocessFolder, () => {
          this.moveAllSplitBatchesToPublishQueue(pluginId, preprocessFolder, () => {
            if (callback) {
              callback();
            }
          });
        });
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  /**
   * Delete the preprocessInput file once the batch splitting is complete
   * @param preprocessFolder
   * @param callback
   */
  deletePreprocessInput(preprocessFolder, callback) {
    log.debug(this.name + " Deleting preprocessed active.flow file");
    const preprocessInputFile = path.join(preprocessFolder, FlowFeedProcessor.ACTIVE_FLOW_FILE);
    this.deleteFile(preprocessInputFile, callback);
  }

  /**
   * Once the preprocessor splits up the active.flow file into batches,
   * move all these files over to the publishing queue,
   * and then
   * @param pluginId
   * @param preprocessFolder,
   * @param callback
   */
  moveAllSplitBatchesToPublishQueue(pluginId, preprocessFolder, callback) {
    log.debug(this.name + " Moving all preprocessed batches to publish queue");
    this.findAllBatchFilesInPreprocessing(preprocessFolder, (batchFiles) => {
      const queueFolder = this.getQueueFolder(pluginId);

      Util.createFolderIfDoesntExist(queueFolder, () => {
        batchFiles.forEach((fileName) => {
          this.publishFile(preprocessFolder, queueFolder, fileName);
        });
        if (callback) {
          callback();
        }
      });
    });
  }

  /**
   * Stream the input file line-by-line, and split the output into
   * separate batch files.
   * @param preprocessFolder
   * @param preprocessFilePath
   * @returns {Promise<boolean>}
   */
  async asyncSplitFile(preprocessFolder, preprocessFilePath) {
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(preprocessFilePath),
        crlfDelay: Infinity
      });

      let timeExtension = this.getTimeExtension();
      let lineCount = 0;
      let batchNumber = 1;
      let activeBatchFile = this.getBatchFileName(preprocessFolder, timeExtension, batchNumber);
      let batchFileLogger = fs.createWriteStream(activeBatchFile, {
        flags: 'a' // 'a' means appending (old data will be preserved)
      });

      rl.on('line', (line) => {
        try {
          lineCount++;
          this.writeLineToBatch(batchFileLogger, line);
          if (lineCount > FlowFeedProcessor.BATCH_SIZE_LIMIT) {
            batchNumber++;
            lineCount = 0;
            activeBatchFile = this.getBatchFileName(preprocessFolder, timeExtension, batchNumber);
            batchFileLogger = fs.createWriteStream(activeBatchFile, {
              flags: 'a' // 'a' means appending (old data will be preserved)
            });
          }
        } catch (err) {
          console.error(this.name + " Unable to process line, "+err);
        }
      });

      await events.once(rl, 'close');
    } catch (err) {
      console.error(this.name + " Unable to pre-process file: " + err);
    }
  }

  /**
   * Write the flow line to the specified batch file
   * @param batchFileLogger
   * @param line
   */
  writeLineToBatch(batchFileLogger, line) {
    batchFileLogger.write(line + '\n');
  }

  /**
   * Create the batch file name for each unique batch as we
   * break the flow feed into chunks
   * @param outputFolder
   * @param timeExtension
   * @param batchNumber
   * @returns {string}
   */
  getBatchFileName(outputFolder, timeExtension, batchNumber) {
    let filePath = path.join(outputFolder, FlowFeedProcessor.BATCH_PREFIX +
      timeExtension+"_"+batchNumber + FlowFeedProcessor.FLOW_EXTENSION);
    return filePath;
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
        log.error('[FlowFeedProcessor] Moved errored out flow file to '+newPath);
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
   * Preprocesses the input file, by moving it into the pre-process directory
   * @param pluginFolder
   * @param preprocessFolder
   * @param callback
   */
  preprocessFile(pluginFolder, preprocessFolder, callback) {
    let oldPath = path.join(pluginFolder, FlowFeedProcessor.ACTIVE_FLOW_FILE);
    let newPath = path.join(preprocessFolder, FlowFeedProcessor.ACTIVE_FLOW_FILE);

    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err;
        log.debug( '[FlowFeedProcessor] Successfully moved file to preprocess '+newPath);
        if (callback) {
          callback(newPath);
        }
      });
    } else {
      if (callback) {
        callback(newPath);
      }
    }
  }


  /**
   * Publish an active file to the publishing queue
   * @param preprocessFolder
   * @param queueFolder
   * @param fileName
   * @param callback
   */
  publishFile(preprocessFolder, queueFolder, fileName, callback) {
    let oldPath = path.join(preprocessFolder, fileName);
    let newPath = path.join(queueFolder, fileName);

    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath,  (err) => {
        if (err) throw err;
        log.debug('[FlowFeedProcessor] Successfully moved batch to publish queue '+fileName);
        if (callback) {
          callback(newPath);
        }
      });
    } else {
      log.warn(this.name + " preprocess file does not exist: "+oldPath);
      if (callback) {
        callback(newPath);
      }
    }
  }

  /**
   * Gets the file name from the path
   * @param filePath
   * @returns {string}
   */
  getFileName(filePath) {
    return path.parse(filePath).base;
  }

  /**
   * Get the queue folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getQueueFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FlowFeedProcessor.PUBLISH_QUEUE_FOLDER);
  }

  /**
   * Get the preprocessing folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getPreprocessFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FlowFeedProcessor.PREPROCESS_FOLDER);
  }

  /**
   * Get the archive folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getArchiveFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FlowFeedProcessor.ARCHIVE_FOLDER);
  }

  /**
   * Get the errors folder corresponding to a pluginId
   * @param pluginId
   * @returns {string}
   */
  getErrorsFolder(pluginId) {
    const allPluginsFolder = Util.getPluginFolderPath();
    const pluginFolder = path.join(allPluginsFolder, pluginId);
    return path.join(pluginFolder, FlowFeedProcessor.ERRORS_FOLDER);
  }


  /**
   * Publish all the batches in the batch folder to the server
   * @param pluginId
   */
  publishAllBatches(pluginId) {
    const queueFolder = this.getQueueFolder(pluginId);

    Util.createFolderIfDoesntExist(queueFolder, () => {
      this.findAllFilesInPublishQueue(pluginId, (batchFileList) => {
        batchFileList.forEach((file) => {
          const filePath = path.join(queueFolder, file);

          log.info(this.name + " Publishing "+filePath);
          const flowBatchDto = this.createEmptyFlowBatch();

          this.asyncProcessLineByLine(flowBatchDto, filePath).then((successfulParse) => {
              if (successfulParse) {
                this.publishBatch(pluginId, flowBatchDto, filePath, file);
              } else {
                this.handleParseFailure(pluginId, filePath, file);
              }
            }
          );
        });
      });
    });
  }

  /**
   * Publish a flow batch to the server and handle the response
   * @param pluginId
   * @param flowBatchDto
   * @param filePath
   * @param fileName
   */
  publishBatch(pluginId, flowBatchDto, filePath, fileName) {
    this.publishBatchToServer(flowBatchDto, (store) => {
      if (store.error) {
        this.handleFailedBatch(pluginId, filePath, store.error);
      } else {
        this.handleSuccessfulBatch(pluginId, filePath, fileName);
      }
    });
  }

  /**
   * Once the batch send is successful, delete the file
   * @param pluginId
   * @param filePath
   * @param fileName
   */
  handleSuccessfulBatch(pluginId, filePath, fileName) {
    log.info(this.name +" Sent 1 batch successfully for "+pluginId);

    this.archiveFile(pluginId, filePath, fileName);
    //this.deleteFile(filePath);
  }

  /**
   * Archive a file into an archive folder
   * @param pluginId
   * @param srcFilePath
   * @param srcFileName
   * @param callback
   */
  archiveFile(pluginId, srcFilePath, srcFileName, callback) {
    let archiveFolder = this.getArchiveFolder(pluginId);
    let newPath = path.join(archiveFolder, srcFileName);

    Util.createFolderIfDoesntExist(archiveFolder, () => {
      this.moveFileToArchive(srcFilePath, srcFileName, newPath, callback);
    });
  }

  /**
   * Move the file to the archive directory
   * @param srcFilePath
   * @param srcFileName
   * @param newPath
   * @param callback
   */
  moveFileToArchive(srcFilePath, srcFileName, newPath, callback) {
    if (fs.existsSync(srcFilePath)) {
      fs.rename(srcFilePath, newPath, (err) => {
        if (err) throw err;
        log.info('[FlowFeedProcessor] Archived flow file ' + srcFileName);
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
   * Deletes the file asynchronously
   * @param filePath
   * @param callback
   */
  deleteFile(filePath, callback) {
    log.debug(this.name + " Deleting old file: "+filePath);
    fs.unlink(filePath, (err) => {
      if (err) {
        log.error("[FlowFeedProcessor] " + err)
      }
      if (callback) {
        callback();
      }
    });
  }


  /**
   * Handle scenario when batch send fails
   * @param pluginId
   * @param file
   */
  handleFailedBatch(pluginId, file, error) {
    log.error(this.name +" Call to server failed: "+error);
    log.info(this.name +" Will retry on next loop");
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
    log.error(this.name +" Failed to parse flow batch: "+filePath);

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
    flowBatchDto.timeSent = Util.getCurrentLocalTimeString(); //update the timestamp to right now

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

    Util.createFolderIfDoesntExist(queueFolder, () => {
      const batchFileList = [];
      fs.readdir(queueFolder, (err, files) => {
        files.forEach(file => {
          let filePath = path.join(queueFolder, file);
          if (fs.statSync(filePath).isFile() && file.endsWith(FlowFeedProcessor.FLOW_EXTENSION)){
            log.debug("[FlowFeedProcessor] found batch in publish queue: "+file);
            batchFileList.push( file );
          }
        });
        callback(batchFileList);
      });
    });
  }

  /**
   * Delete all old archive files that are older than 2 months
   * @param pluginId
   * @param callback
   */
  deleteOldArchiveFiles(pluginId, callback) {
    log.debug(this.name + " Cleaning up old archive files for "+pluginId);
    let archiveFolder = this.getArchiveFolder(pluginId);
    Util.createFolderIfDoesntExist(archiveFolder, () => {
      const twoMonthsAgoDate = this.getTwoMonthsAgoDate();
      fs.readdir(archiveFolder, (err, files) => {
        files.forEach(file => {
          let filePath = path.join(archiveFolder, file);
          let stats = fs.statSync(filePath);
          if (stats.isFile()
            && file.endsWith(FlowFeedProcessor.FLOW_EXTENSION)
            && file.startsWith(FlowFeedProcessor.BATCH_PREFIX)
            && this.isOlderThanDate(twoMonthsAgoDate, stats.birthtime) ){
            this.deleteFile(filePath);
          }
        });
        callback();
      });
    });
  }

  /**
   * Get the date of two months before the current data
   */
  getTwoMonthsAgoDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
    return date;
  }

  /**
   * Check if the date to check is older than the threshold date
   * @param thresholdDate
   * @param dateToCheck
   */
  isOlderThanDate(thresholdDate, dateToCheck) {
    return dateToCheck < thresholdDate;
  }

  /**
   * Get a list of all the batch files generated by the preprocessor
   * @param preprocessFolder
   * @param callback
   */
  findAllBatchFilesInPreprocessing(preprocessFolder, callback) {

    const batchFileList = [];
    fs.readdir(preprocessFolder, (err, files) => {
      files.forEach(file => {
        if (fs.statSync(preprocessFolder + "/" + file).isFile()
          && file.endsWith(FlowFeedProcessor.FLOW_EXTENSION)
          && file.startsWith(FlowFeedProcessor.BATCH_PREFIX)){
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

    let random = Math.floor(Math.random()*10000);

    return today.substr(0, today.indexOf('.')) + "_"+random;
  }

  /**
   * Publish the flow batch to the server
   * @param flowBatchDto
   * @param callback
   */
  doFlowBatchPublish(flowBatchDto, callback) {
    this.urn = "/flow/input/batch";

    this.callback = callback;
    this.store = {
      context: "FlowFeedProcessor",
      dto: flowBatchDto,
      guid: Util.getGuid(),
      name: "FeedStore",
      requestType: "post",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " flow input batch -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
