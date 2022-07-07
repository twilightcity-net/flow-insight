const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new top emoji databases that stores recent emojis used
 * @type {DMDatabase}
 */
module.exports = class EmojiDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "emoji";
  }

  /**
   * the collections of our database
   * @constructor
   */
  static get Collections() {
    return {
      EMOJI: "emoji",
    };
  }

  /**
   * the views of our database for queries
   * @constructor
   */
  static get Views() {
    return {
      EMOJI: "emoji",
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
    };
  }

  /**
   * builds our team database from lokijs instance
   */
  constructor() {
    super(EmojiDatabase.Name);
    this.name = "[DMDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(EmojiDatabase.Collections.EMOJI, {
      indices: [
        EmojiDatabase.Indices.ID
      ],
    });

    const emojiView = this.getCollection(
      EmojiDatabase.Collections.EMOJI
    ).addDynamicView(EmojiDatabase.Views.EMOJI);

    emojiView.applySort(function (obj1, obj2) {
      if (obj1.order === obj2.order) return 0;
      if (obj1.order < obj2.order) return 1;
      if (obj1.order > obj2.order) return -1;
    });

  }

  /**
   * gets our view for all of our recent emoji
   * @returns {DynamicView}
   */
  getViewForEmoji() {
    let collection = this.getCollection(
      EmojiDatabase.Collections.EMOJI
    );
    return collection.getDynamicView(
      EmojiDatabase.Views.EMOJI
    );
  }

  /**
   * Load emoji track data from server into the local DB
   * @param tracks
   */
  loadEmojiTracks(tracks) {
    let collection = this.getCollection(
      EmojiDatabase.Collections.EMOJI
    );

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const emojiRecord = {id: track.emoji, frequency: track.frequency, order: (tracks.length - i - 1)}
      collection.insert(emojiRecord);
    }
  }

  /**
   * The most recently used emojis are maintained by an order field, get the max assigned
   * so far.  These are sorted in desc order.
   * @returns {number}
   */
  getMaxSortOrder() {
    let max = 0;
    const rows = this.getViewForEmoji().data();
    for (let row of rows) {
      if (row.order > max) {
        max = row.order;
      }
    }
    return max;
  }

  /**
   * Increment the frequency and recency of a particular emoji
   * @param emoji
   */
  trackEmoji(emoji) {
    let collection = this.getCollection(
      EmojiDatabase.Collections.EMOJI
    );

    const max = this.getMaxSortOrder();

    let emojiRecord = collection.findOne({id : emoji});
    if (emojiRecord) {
      emojiRecord.frequency++;
      emojiRecord.order = (max + 1);
      collection.update(emojiRecord);
    } else {
      emojiRecord = {id: emoji, frequency: 1, order: (max + 1)}
      collection.insert(emojiRecord);
    }
  }

};
