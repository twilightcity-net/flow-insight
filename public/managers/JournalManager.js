const JournalController = require("../controllers/JournalController");

/**
 * managing class for the journal client
 */
module.exports = class JournalManager {
  /**
   * builds the circuit manager for the global app scope
   */
  constructor() {
    this.name = "[JournalManager]";
    this.myController = new JournalController(this);
    this.myController.configureEvents();
  }
};
