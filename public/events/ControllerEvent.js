const Util = require("../Util");

/**
 * this is a child event which wraps various events used for our
 * main process controllers
 */
class ControllerEvent {
  /**
   * ControllerEvent
   * @param type
   * @param data
   * @constructor
   */
  constructor(type, data) {
    this.id = Util.getGuid();
    this.type = type;
    this.data = data;
  }
}

module.exports = ControllerEvent;
