const log = require("electron-log"),
  chalk = require("chalk");

/**
 * general purpose global utility functions for our Database
 * @type {Util}
 */
module.exports = class DatabaseUtil {
  /**
   * logs a database message with a fancy blue color
   * @param message
   * @param count
   */
  static log(message, count) {
    log.info(
      chalk.blueBright("[Database]") +
        " " +
        message +
        " : {" +
        count +
        "}"
    );
  }

  /**
   * finds a specific document in a collection and updates it with a new
   * cloned copy of it. This is to prevent any memory collisions within
   * our in memory database.
   * @param doc
   * @param collection
   */
  static findRemoveInsert(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      collection.remove(result);
    }
    result = Object.assign({}, doc);
    collection.insert(result);
  }

  /**
   * finds a specific document in a collection and updates the
   * object rather then removing it.
   * @param doc
   * @param collection
   */
  static findUpdateInsert(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      result = Object.assign(result, doc);
      collection.update(result);
    } else {
      result = Object.assign({}, doc);
      collection.insert(result);
    }
  }

  /**
   * seek and destroy, t-1000 style. looks up a document of a
   * given collection by its id and then remove it.
   * @param doc
   * @param collection
   */
  static findRemove(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      collection.remove(result);
    }
  }
};
