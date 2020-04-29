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
   * @returns {{ROOMS: string, FLUX_TALK_MESSAGES: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Collections() {
    return {
      TALK_MESSAGES: "talk-messages",
      FLUX_TALK_MESSAGES: "flux-talk-messages",
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
   * @returns {{ROOMS: string, FLUX_TALK_MESSAGES: string, STATUS_TALK_MESSAGES: string, TALK_MESSAGES: string}}
   * @constructor
   */
  static get Views() {
    return {
      TALK_MESSAGES: "talk-messages",
      STATUS_TALK_MESSAGES: "status-talk-messages",
      FLUX_TALK_MESSAGES: "flux-talk-messages",
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
      indices: [
        TalkDatabase.Indices.URI,
        TalkDatabase.Indices.ROOM_NAME
      ]
    });

    this.getCollection(
      TalkDatabase.Collections.ROOMS
    ).addDynamicView(TalkDatabase.Views.ROOMS);
    this.addCollection(
      TalkDatabase.Collections.FLUX_TALK_MESSAGES,
      {
        indices: [
          TalkDatabase.Indices.ID,
          TalkDatabase.Indices.URI
        ]
      }
    );

    this.getCollection(
      TalkDatabase.Collections.FLUX_TALK_MESSAGES
    ).addDynamicView(TalkDatabase.Views.FLUX_TALK_MESSAGES);
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
   * gets our view for our flux talk messages. a flux talk message is a message that
   * has been posted to the gridtime server and is awaiting the talk network to
   * push the spawned message to use to validate.
   * @returns {DynamicView}
   */
  getViewFluxTalkMessages() {
    let collection = this.getCollection(
      TalkDatabase.Collections.FLUX_TALK_MESSAGES
    );
    return collection.getDynamicView(
      TalkDatabase.Views.FLUX_TALK_MESSAGES
    );
  }

  /**
   * adds or returns and existing collection in our database
   * @param roomName
   * @returns {Collection}
   */
  getCollectionForRoomTalkMessages(roomName) {
    let name = this.getTalkMessagesCollectionNameFromRoomName(
        roomName
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
   * @param roomName
   * @returns {Collection}
   */
  getCollectionForRoomStatusTalkMessages(roomName) {
    let name = this.getStatusTalkMessagesCollectionNameFromRoomName(
        roomName
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
   * @param roomName
   * @returns {string}
   */
  getTalkMessagesCollectionNameFromRoomName(roomName) {
    return (
      TalkDatabase.Collections.TALK_MESSAGES +
      "-" +
      roomName
    );
  }

  /**
   * gets our name for our talk message collection for our database
   * @param roomName
   * @returns {string}
   */
  getStatusTalkMessagesCollectionNameFromRoomName(
    roomName
  ) {
    return (
      this.getTalkMessagesCollectionNameFromRoomName(
        roomName
      ) + "-status"
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
};
