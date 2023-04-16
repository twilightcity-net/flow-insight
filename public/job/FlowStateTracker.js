const log = require("electron-log"),
  chalk = require("chalk");
const Util = require("../Util");
const {DtoClient} = require("../managers/DtoClientFactory");


/**
 * This class is used to track realtime flow state for this user
 * @type {FlowStateTracker}
 */
module.exports = class FlowStateTracker {
  constructor() {
    this.name = "[FlowStateTracker]";
  }

  static KEY_TIME = "as.of.time";
  static KEY_MOMENTUM = "current.momentum";
  static KEY_MODCOUNT = "mod.keycounts";

  /**
   * Take in a new batch of flow activity and update our flow state
   * @param batch
   */
  processBatch(batch) {

  }

  /**
   * Refresh latest flow state from the server, and update current status after
   * adjusting to the latest server status + any recent activity processing
   */
  refresh() {
    this.doFetchLatestFlowState((arg) => {
      if (arg.error) {
        this.handleFailedRefresh(arg.error);
      } else {
        this.updateSnapshotFlowState(arg.data);
      }
    });
  }

  /**
   * Update the referenced snapshot of the flowstate from the server,
   * and start keeping track of data after this state
   * @param tableResult
   */
  updateSnapshotFlowState(tableResult) {
    log.info("updateSnapshotFlowState returned!");

    let rows = tableResult.rowsOfPaddedCells;
    let keyMap = this.toKeyMap(rows);

    let timestamp = this.toTimestamp(keyMap.get(FlowStateTracker.KEY_TIME));
    let currentMomentum = this.toInt(keyMap.get(FlowStateTracker.KEY_MOMENTUM));
    let modkeysRollover = this.toRolloverCounts(keyMap.get(FlowStateTracker.KEY_MODCOUNT));

    log.info("timestamp = "+timestamp);
    log.info("momentum = "+currentMomentum);
    log.info("modkeys = "+JSON.stringify(modkeysRollover));
  }


  /**
   * Convert to a rollover data count object if not null
   * Example src format: 158.0 [128.0, 0.0, 0.0, 30.0, 0.0]
   * @param rolloverCounts
   */
  toRolloverCounts(rolloverCounts) {
    let rollover = {};
    if (rolloverCounts) {
      let parts = rolloverCounts.replace('[','').replace(']','').replace(',','').split(" ");
      rollover.total = parseFloat(parts[0]);
      rollover.parts = [];
      rollover.parts.push(parseFloat(parts[1]));
      rollover.parts.push(parseFloat(parts[2]));
      rollover.parts.push(parseFloat(parts[3]));
      rollover.parts.push(parseFloat(parts[4]));
      rollover.parts.push(parseFloat(parts[5]));
      return rollover;
    } else {
      return null;
    }
  }



  /**
   * Convert to an integer if not null
   * @param intStr
   * @returns {null|number}
   */
  toInt(intStr) {
    if (intStr) {
      return parseInt(intStr);
    } else {
      return null;
    }
  }

  /**
   * Convert to a local date object if not null
   * @param utcTimeStr
   * @return {null|Date}
   */
  toTimestamp(utcTimeStr) {
    if (utcTimeStr) {
      return Util.getDateFromUTCStr(utcTimeStr);
    } else {
      return null;
    }
  }
  /**
   * Convert property rows to a keymap structure
   * @param rows
   * @returns {Map<any, any>}
   */
  toKeyMap(rows) {
    let keyMap = new Map();
    for (let i = 0; i < rows.length; i++) {
      keyMap.set(rows[i][0].trim(), rows[i][1].trim());
    }
    return keyMap;
  }
  //
  // [1]   title: 'Latest Flow State',
  // [1]   headers: [ 'Key              ', 'Description                      ' ],
  // [1]   rowsOfPaddedCells: [
  //   [1]     [ 'current.momentum ', '0                                ' ],
  // [1]     [ 'mod.keycounts    ', '85.0 [0.0, 25.0, 0.0, 5.0, 55.0] ' ],
  // [1]     [ 'as.of.time       ', '2023-04-16T18:40:00              ' ]
  // [1]   ]
  // [1] }

  handleFailedRefresh(error) {
    log.error("Failed to refresh flow state: "+error);
  }

  /**
   * Retrieve latest flow state from the server
   * @param callback
   */
  doFetchLatestFlowState(callback) {
    this.urn = "/flow/latest";

    this.callback = callback;
    this.store = {
      context: "FlowStateTracker",
      dto: {},
      guid: Util.getGuid(),
      name: "FeedStore",
      requestType: "get",
      timestamp: new Date().getTime(),
      urn: this.urn,
    };
    log.debug(this.name + " fetch latest flow state -> do request");
    let client = new DtoClient(this.store, this.callback);
    client.doRequest();
  }


};
