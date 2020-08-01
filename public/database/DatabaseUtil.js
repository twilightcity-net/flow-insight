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
   * finds a specific doc in a collection and will insert a new one
   * if it is not found in the collection. Almost like the others
   * but it isn't.
   * @param doc
   * @param collection
   */
  static findInsert(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (!result) {
      collection.insert(doc);
    }
  }

  /**
   * finds a specific document in our collection and updates it
   * with the doc that is input as the doc argument. Works like
   * findUpdateInsert but does not insert. Just the tip.s
   * @param doc
   * @param collection
   */
  static findUpdate(doc, collection) {
    let result = collection.findOne({ id: doc.id });
    if (result) {
      result = Object.assign(result, doc);
      collection.update(result);
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
