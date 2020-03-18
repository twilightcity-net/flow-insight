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
   * @returns {{ROOMS: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TALK_MESSAGES: "talk-messages",
      ROOMS: "rooms"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{NANO_TIME: string, ROOM_NAME: string, MESSAGE_TYPE: string, ID: string, MESSAGE_TIME: string, URI: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      URI: "uri",
      MESSAGE_TIME: "messageTime",
      NANO_TIME: "nanoTime",
      MESSAGE_TYPE: "messageType",
      ROOM_NAME: "roomName"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{ROOMS: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Views() {
    return {
      TALK_MESSAGES: "talk-messages",
      ROOMS: "rooms"
    };
  }

  /**
   * builds our talk database for talk messages and rooms
   */
  constructor() {
    super(TalkDatabase.Name);
    this.name = "[DB.TalkDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(TalkDatabase.Collections.ROOMS, {
      indices: [TalkDatabase.Indices.URI, TalkDatabase.Indices.ROOM_NAME]
    });

    this.getCollection(TalkDatabase.Collections.ROOMS).addDynamicView(
      TalkDatabase.Views.ROOMS
    );
  }

  /**
   * gets our view for our known rooms
   * @returns {DynamicView}
   */
  getViewRooms() {
    let collection = this.getCollection(TalkDatabase.Collections.ROOMS);
    return collection.getDynamicView(TalkDatabase.Views.ROOMS);
  }

  /**
   * adds or returns and existing collection in our database
   * @param roomName
   * @returns {Collection}
   */
  getCollectionForRoomTalkMessages(roomName) {
    let name = this.getTalkMessagesCollectionNameFromRoomName(roomName),
      collection = this.getCollection(name);

    if (!collection) {
      collection = this.addTalkMessagesCollection(roomName);
    }
    return collection;
  }

  /**
   * creates a new talk message collection unique to the room name
   * @param roomName
   * @returns {Collection}
   */
  addTalkMessagesCollection(roomName) {
    let name = this.getTalkMessagesCollectionNameFromRoomName(roomName),
      indices = {
        indices: [
          TalkDatabase.Indices.ID,
          TalkDatabase.Indices.URI,
          TalkDatabase.Indices.MESSAGE_TIME,
          TalkDatabase.Indices.NANO_TIME,
          TalkDatabase.Indices.MESSAGE_TYPE
        ]
      },
      collection = this.addCollection(name, indices);

    collection.addDynamicView(TalkDatabase.Views.TALK_MESSAGES);
    return collection;
  }

  /**
   * gets our name for our talk message collection for our database
   * @param roomName
   * @returns {string}
   */
  getTalkMessagesCollectionNameFromRoomName(roomName) {
    return TalkDatabase.Collections.TALK_MESSAGES + "-" + roomName;
  }

  /**
   * gets our view for our specified collection
   * @param collection
   * @returns {DynamicView}
   */
  getViewTalkMessagesForCollection(collection) {
    return collection.getDynamicView(TalkDatabase.Views.TALK_MESSAGES);
  }
};
