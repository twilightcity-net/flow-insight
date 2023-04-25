const FlowController = require("../controllers/FlowController");

/**
 * managing class for the flow client
 */
module.exports = class FlowManager {
  /**
   * builds the flow manager for the global app scope
   */
  constructor() {
    this.name = "[FlowManager]";
    this.myController = new FlowController(this);
    this.myController.configureEvents();
  }

  init(callback) {
    //nothing to do for preloading
  }

  getMyFlow() {
    return this.myController.getMyFlow();
  }

  updateMyFlow(flowData) {
    this.myController.updateMyFlow(flowData);
  }
};
