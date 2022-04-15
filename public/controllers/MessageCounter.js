const log = require("electron-log"),
  chalk = require("chalk");

/**
 * Counts talk messages received to support synchronization checks during heartbeats
 * @type {Util}
 */
module.exports = class MessageCounter {

  constructor() {
    this.name = "[MessageCounter]";
    this.messageCounterPerUri = new Map();
  }

  /**
   * logs a message with a fancy blue color
   * @param message
   */
  log(message) {
    log.info(
      chalk.blueBright(this.name) +
      " " +
      message
    );
  }

  /**
   * logs a message for the counter
   * @param message
   */
  logCount(uri, counter) {
    log.info(
      chalk.blueBright(this.name) +
      " Messages for "+uri.substr(0, 8) + " [count:"+counter.count + ", min:"+counter.minNanoTime + ", max:"+counter.maxNanoTime + "]"
    );
  }

  /**
   * Count this message as received for the specified uri (talk room id)
   * and increment the message count within our time window
   * @param uri
   * @param nanoTime
   * @param message
   */
  trackMessage(uri, nanoTime, message) {

    let messageCounter = this.messageCounterPerUri.get(uri);
    if (!messageCounter) {
      messageCounter = {uri: uri, count: 1, minNanoTime: nanoTime, maxNanoTime: nanoTime};
      this.messageCounterPerUri.set(uri, messageCounter);
    } else {
      if (nanoTime >= messageCounter.minNanoTime) {
        messageCounter.count = messageCounter.count + 1;

        if (nanoTime > messageCounter.maxNanoTime) {
          messageCounter.maxNanoTime = nanoTime;
        }
      }
    }
    this.logCount(uri, messageCounter);
  }

  /**
   * Returns the message counter associated with this uri (talk room id)
   * This can be used to make sure we are in sync with the server
   * @param uri
   * @returns {*}
   */
  getMessageCounter(uri) {
    let counter = this.messageCounterPerUri.get(uri);
    if (counter) {
      this.logCount(uri, counter);
    } else {
      this.log("Requested counter not found!");
    }
  }

  /**
   * Returns all message counters recorded since the last reset
   * @returns {*}
   */
  getMessageCounters() {
    let simpleMessageCounters = [];
    for (let counter of this.messageCounterPerUri.values()) {
      simpleMessageCounters.push(counter);
    }
    return simpleMessageCounters;
  }

  /**
   * Remove all counters except for the specified active rooms
   */
  prune(rooms) {
    let prunedCounters = new Map();

    for (let uri of rooms) {
      let counter = this.messageCounterPerUri.get(uri);
      if (counter) {
        prunedCounters.set(uri,counter);
      }
    }

    this.messageCounterPerUri = prunedCounters;
  }

  /**
   * Resets all the message counters, so the next set of validations
   * will be for a new set of messages.  Reset when we get into a bad state.
   */
  reset() {
    this.log("Resetting message counters!");
    this.messageCounterPerUri = new Map();
  }

};
