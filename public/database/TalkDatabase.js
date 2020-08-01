const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil"),
  BaseController = require("../controllers/BaseController");

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
   * @returns {{ROOMS: string, STATUS_TALK_MESSAGES: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TALK_MESSAGES: "talk-messages",
      STATUS_TALK_MESSAGES: "status-talk-messages",
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
   * @returns {{ROOMS: string, STATUS_TALK_MESSAGES: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Views() {
    return {
      TALK_MESSAGES: "talk-messages",
      STATUS_TALK_MESSAGES: "status-talk-messages",
      ROOMS: "rooms"
    };
  }

  /**
   * builds our talk database for talk messages and rooms
   */
  constructor() {
    super(TalkDatabase.Name);
    this.name = "[TalkDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(TalkDatabase.Collections.ROOMS, {
      indices: [
        TalkDatabase.Indices.URI,
        TalkDatabase.Indices.ROOM_NAME
      ]
    });
    this.getCollection(
      TalkDatabase.Collections.ROOMS
    ).addDynamicView(TalkDatabase.Views.ROOMS);
  }

  /**
   * gets our view for our known rooms
   * @returns {DynamicView}
   */
  getViewRooms() {
    let collection = this.getCollection(
      TalkDatabase.Collections.ROOMS
    );
    return collection.getDynamicView(
      TalkDatabase.Views.ROOMS
    );
  }

  /**
   * adds or returns and existing collection in our database
   * @returns {Collection}
   * @param uri
   */
  getCollectionForRoomTalkMessages(uri) {
    let name = this.getTalkMessagesCollectionNameFromUri(
        uri
      ),
      collection = this.getCollection(name),
      view = TalkDatabase.Views.TALK_MESSAGES;

    if (!collection) {
      collection = this.addTalkMessagesCollection(
        name,
        view
      );
    }
    return collection;
  }

  /**
   * adds or returns and existing collection in our database
   * @param uri
   * @returns {Collection}
   */
  getCollectionForRoomStatusTalkMessages(uri) {
    let name = this.getStatusTalkMessagesCollectionNameFromUri(
        uri
      ),
      collection = this.getCollection(name),
      view = TalkDatabase.Views.STATUS_TALK_MESSAGES;

    if (!collection) {
      collection = this.addStatusTalkMessagesCollection(
        name,
        view
      );
    }
    return collection;
  }

  /**
   * creates a new talk message collection unique to the room name
   * @returns {Collection}
   * @param name
   * @param view
   */
  addTalkMessagesCollection(name, view) {
    let indices = {
        indices: [
          TalkDatabase.Indices.ID,
          TalkDatabase.Indices.URI,
          TalkDatabase.Indices.MESSAGE_TIME,
          TalkDatabase.Indices.NANO_TIME,
          TalkDatabase.Indices.MESSAGE_TYPE
        ]
      },
      collection = this.addCollection(name, indices);

    collection.addDynamicView(view);
    return collection;
  }

  /**
   * creates a new status talk message collection unique to the room name
   * @returns {Collection}
   * @param name
   * @param view
   */
  addStatusTalkMessagesCollection(name, view) {
    let indices = {
        indices: [
          TalkDatabase.Indices.ID,
          TalkDatabase.Indices.URI,
          TalkDatabase.Indices.MESSAGE_TIME,
          TalkDatabase.Indices.NANO_TIME,
          TalkDatabase.Indices.MESSAGE_TYPE
        ]
      },
      collection = this.addCollection(name, indices);

    collection.addDynamicView(view);
    return collection;
  }

  /**
   * gets our name for our talk message collection for our database
   * @param uri
   * @returns {string}
   */
  getTalkMessagesCollectionNameFromUri(uri) {
    return (
      TalkDatabase.Collections.TALK_MESSAGES + "-" + uri
    );
  }

  /**
   * gets our name for our status talk message collection for our database
   * @param uri
   * @returns {string}
   */
  getStatusTalkMessagesCollectionNameFromUri(uri) {
    return (
      TalkDatabase.Collections.STATUS_TALK_MESSAGES +
      "-" +
      uri
    );
  }

  /**
   * gets our view for our specified collection of anything thats not a status message
   * which have their own status collection in this database for each circuit
   * room that we create in gridtime
   * @param collection
   * @returns {DynamicView}
   */
  getViewTalkMessagesForCollection(collection) {
    return collection.getDynamicView(
      TalkDatabase.Views.TALK_MESSAGES
    );
  }

  /**
   * gets our view for our specified collection of the status variety
   * @param collection
   * @returns {DynamicView}
   */
  getViewStatusTalkMessagesForCollection(collection) {
    return collection.getDynamicView(
      TalkDatabase.Views.STATUS_TALK_MESSAGES
    );
  }

  /**
   * updates our member status of the person that is in the room through
   * an incoming talk message. data is the message data that comes in
   * from the connection to the talk room.
   * @param uri
   * @param status
   */
  updateRoomMemberStatus(uri, status) {
    let collection = this.getCollectionForRoomStatusTalkMessages(
        uri
      ),
      roomMember = status.roomMember,
      memberId = roomMember.memberId,
      statusEvent = status.statusEvent;

    DatabaseUtil.findInsert(status, collection);
    DatabaseUtil.log(
      "update room member status -> " + statusEvent,
      memberId
    );
  }

  /**
   * adds a room to our rooms collection for reference
   * @param roomName
   * @param uri
   */
  findRoomAndInsert(roomName, uri) {
    let rooms = this.getCollection(
        TalkDatabase.Collections.ROOMS
      ),
      room = rooms.findOne({ uri: uri });

    if (!room && roomName && uri) {
      rooms.insert({
        roomName: roomName,
        uri: uri
      });

      DatabaseUtil.log("insert room -> " + roomName, uri);
    }
  }

  /**
   * inserts a new room message into a collection for the specified room in
   * our local database. This is usually called by the loading functions.
   * @param message
   * @param collection
   */
  insertRoomStatusMessage(message, collection) {
    DatabaseUtil.findInssert(message, collection);
  }

  /**
   * inserts a new chat details message into the proper room collection for
   * the member and circuit.
   * @param message
   * @param collection
   */
  insertRoomChatMessage(message, collection) {
    DatabaseUtil.findInsert(message, collection);
  }
};
