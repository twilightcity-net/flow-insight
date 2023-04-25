const log = require("electron-log"),
  chalk = require("chalk"),
  fs = require("fs"),
  events = require("events"),
  readline = require("readline");

const NewEditorActivityDto = require("../dto/NewEditorActivityDto");
const NewExternalActivityDto = require("../dto/NewExternalActivityDto");
const NewExecutionActivityDto = require("../dto/NewExecutionActivityDto");
const NewModificationActivityDto = require("../dto/NewModificationActivityDto");
const NewFlowBatchEventDto = require("../dto/NewFlowBatchEventDto");

/**
 * This class is used to read a flow feed file
 * @type {FlowFileReader}
 */
module.exports = class FlowFileReader {
  constructor() {
    this.name = "[FlowFeedReader]";
  }

  static EditorActivity = "EditorActivity";
  static ExecutionActivity = "ExecutionActivity";
  static ModificationActivity = "ModificationActivity";
  static ExternalActivity = "ExternalActivity";
  static Event = "Event";


  /**
   * Read the lines from a batch file, and add elements to the batch
   * @param filePath
   * @param data
   * @param onLineHandler
   * @returns {Promise<boolean>}
   */
  async asyncProcessFile(filePath, data, onLineHandler) {
    let lineError;
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        try {
          this.parseLineAndCallHandler(line, data, onLineHandler);
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

  parseLineAndCallHandler(line, data, handler) {
    let lineType = this.parseTypeFromLine(line);
    let json = this.parseJsonObjectFromLine(line);

    handler(data, lineType, json);
  }

  parseTypeFromLine(line) {
    return line.substr(0, line.indexOf("="));
  }

  parseJsonObjectFromLine(line) {
    const lineType = line.substr(0, line.indexOf("="));
    const jsonStr = line.substr(line.indexOf("=") + 1);

    switch (lineType) {
      case FlowFileReader.EditorActivity:
        return new NewEditorActivityDto(jsonStr);
      case FlowFileReader.ExternalActivity:
        return new NewExternalActivityDto(jsonStr);
      case FlowFileReader.ExecutionActivity:
        return new NewExecutionActivityDto(jsonStr);
      case FlowFileReader.ModificationActivity:
        return new NewModificationActivityDto(jsonStr);
      case FlowFileReader.Event:
        return new NewFlowBatchEventDto(jsonStr);
      default:
        throw new Error("Unable to parse unknown event type = "+lineType);
    }
  }


};
