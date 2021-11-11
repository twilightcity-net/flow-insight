const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new dictionary database that stores words from the team dictionary
 * @type {DictionaryDatabase}
 */
module.exports = class DictionaryDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "dictionary";
  }

  /**
   * the collections of our database
   * @returns {{DICTIONARY: string}}
   * @constructor
   */
  static get Collections() {
    return {
      DICTIONARY: "dictionary"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{DICTIONARY: string}}
   * @constructor
   */
  static get Views() {
    return {
      DICTIONARY: "dictionary"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{ID: string, WORD: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      WORD: "word"
    };
  }

  /**
   * builds our dictionary database from lokijs instance
   */
  constructor() {
    super(DictionaryDatabase.Name);
    this.name = "[DictionaryDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(DictionaryDatabase.Collections.DICTIONARY, {
      indices: [
        DictionaryDatabase.Indices.ID,
        DictionaryDatabase.Indices.WORD
      ]
    });
    this.getCollection(
      DictionaryDatabase.Collections.DICTIONARY
    ).addDynamicView(DictionaryDatabase.Views.DICTIONARY);
  }

  /**
   * gets our view for all of our words in the dictionary
   * @returns {DynamicView}
   */
  getViewForDictionary() {
    let collection = this.getCollection(
      DictionaryDatabase.Collections.DICTIONARY
    );
    return collection.getDynamicView(
      DictionaryDatabase.Views.DICTIONARY
    );
  }

  /**
   * Initial load of all the words in the entire dictionary
   * @param wordList
   */
  loadFullDictionary(wordList) {
    if (wordList && wordList.length > 0) {
       let collection = this.getCollection(DictionaryDatabase.Collections.DICTIONARY);

       for (let i = 0; i < wordList.length; i++) {
         DatabaseUtil.findRemoveInsert(wordList[i], collection);
       }
    }
  }

  /**
   * Update the word in the dictionary, could be a new word or an existing word
   * having its definition updated, so update using the id
   * @param wordDef
   */
  updateDictionaryWord(wordDef) {
    let collection = this.getCollection(
      DictionaryDatabase.Collections.DICTIONARY
    );

    DatabaseUtil.findRemoveInsert(wordDef, collection);
  }

  /**
   * gets our view for our team dictionary
   * @returns {DynamicView}
   */
  getTeamDictionaryView() {
    let collection = this.getCollection(
      DictionaryDatabase.Collections.DICTIONARY
    );
    return collection.getDynamicView(
      DictionaryDatabase.Views.DICTIONARY
    );
  }

};
