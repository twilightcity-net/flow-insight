const LokiJS = require("lokijs"),
  Util = require("../Util");

/**
 * this class is used for building new talk databases
 * @type {TalkDatabase}
 */
module.exports = class TalkDatabase extends LokiJS {
  /**
   * the name of our talk database file
   * @returns {string}
   */
  static get Name() {
    return "talk";
  }

  /**
   * the collections of our database
   * @returns {{ROOMS: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TALK_MESSAGES: "talk-messages"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{NANO_TIME: string, MESSAGE_TYPE: string, ID: string, MESSAGE_TIME: string, URI: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      URI: "uri",
      MESSAGE_TIME: "messageTime",
      NANO_TIME: "nanoTime",
      MESSAGE_TYPE: "messageType"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{ROOMS: string}}
   * @constructor
   */
  static get Views() {
    return {
      TALK_MESSAGES: "talk-messages"
    };
  }

  /**
   * builds our talk database for talk messages
   */
  constructor() {
    super(TalkDatabase.Name);
    this.name = "[DB.TalkDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(TalkDatabase.Collections.TALK_MESSAGES, {
      indices: [
        TalkDatabase.Indices.ID,
        TalkDatabase.Indices.URI,
        TalkDatabase.Indices.MESSAGE_TIME,
        TalkDatabase.Indices.NANO_TIME,
        TalkDatabase.Indices.MESSAGE_TYPE
      ]
    });
    this.getCollection(TalkDatabase.Collections.TALK_MESSAGES).addDynamicView(
      TalkDatabase.Views.TALK_MESSAGES
    );
  }

  /**
   * gets our view for our known talk messages
   * @returns {DynamicView}
   */
  getViewTalkMessages() {
    let collection = this.getCollection(TalkDatabase.Collections.TALK_MESSAGES);
    return collection.getDynamicView(TalkDatabase.Views.TALK_MESSAGES);
  }
};
