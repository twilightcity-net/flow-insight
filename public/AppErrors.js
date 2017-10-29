const Util = require("./Util");
/*
 * Base Exception class for app, all other errors should extend this
 */
module.exports = class AppError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "AppError";
    this.date = new Date();
  }

  /*
   * returns the error in string format
   */
  toString() {
    return (
      "[" +
      this.name +
      " :: " +
      this.message +
      " @ " +
      Util.getDateTimeString(this.date) +
      "]"
    );
  }
};
