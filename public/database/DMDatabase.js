const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new buddy databases that stores direct message information
 * @type {DMDatabase}
 */
module.exports = class DMDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "dm";
  }

  /**
   * the collections of our database
   * @constructor
   */
  static get Collections() {
    return {
      MESSAGE: "message",
      REACTION: "reaction"
    };
  }

  /**
   * the views of our database for queries
   * @constructor
   */
  static get Views() {
    return {
      MESSAGE: "message",
      REACTION: "reaction"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      FROM_MEMBER_ID: "fromMemberId",
      TO_MEMBER_ID: "toMemberId",
      WITH_MEMBER_ID: "withMemberId",
      MESSAGE_ID: "messageId"
    };
  }

  /**
   * builds our team database from lokijs instance
   */
  constructor() {
    super(DMDatabase.Name);
    this.name = "[DMDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(DMDatabase.Collections.MESSAGE, {
      indices: [
        DMDatabase.Indices.ID,
        DMDatabase.Indices.FROM_MEMBER_ID,
        DMDatabase.Indices.TO_MEMBER_ID,
        DMDatabase.Indices.WITH_MEMBER_ID,
      ],
    });

    this.addCollection(DMDatabase.Collections.REACTION, {
      indices: [
        DMDatabase.Indices.ID,
        DMDatabase.Indices.FROM_MEMBER_ID,
        DMDatabase.Indices.MESSAGE_ID
      ],
    });

    const messageView = this.getCollection(
      DMDatabase.Collections.MESSAGE
    ).addDynamicView(DMDatabase.Views.MESSAGE);

    messageView.applySort(function (obj1, obj2) {
      if (obj1.createdDate === obj2.createdDate) return 0;
      if (obj1.createdDate < obj2.createdDate) return -1;
      if (obj1.createdDate > obj2.createdDate) return 1;
    });

    this.getCollection(
      DMDatabase.Collections.REACTION
    ).addDynamicView(DMDatabase.Views.REACTION);
  }

  /**
   * gets our view for all of our buddies
   * @returns {DynamicView}
   */
  getViewForMessages() {
    let collection = this.getCollection(
      DMDatabase.Collections.MESSAGE
    );
    return collection.getDynamicView(
      DMDatabase.Views.MESSAGE
    );
  }

  /**
   * gets our view for all of our pending buddy requests
   * @returns {DynamicView}
   */
  getViewForReactions() {
    let collection = this.getCollection(
      DMDatabase.Collections.REACTION
    );
    return collection.getDynamicView(
      DMDatabase.Views.REACTION
    );
  }

  /**
   * Get all the DMs for a conversation with a member
   * @param memberId
   * @returns {*}
   */
  findDMsWithMember(memberId) {
    let collection = this.getCollection(
      DMDatabase.Collections.MESSAGE
    );

    return collection.chain().find({ withMemberId: memberId }).simplesort('timestamp').data();
  }

  /**
   * Get all the reactions for a conversation with a member
   * @param memberId
   * @returns {*}
   */
  findReactionsWithMember(memberId) {
    let collection = this.getCollection(
      DMDatabase.Collections.REACTION
    );

    return collection.chain().find({ withMemberId: memberId }).simplesort('timestamp').data();
  }

  /**
   * Add a message to the DM message database
   * @param message
   */
  addMessage(message) {
    let collection = this.getCollection(
      DMDatabase.Collections.MESSAGE
    );

    DatabaseUtil.findRemoveInsert(message, collection);
  }

  /**
   * Add a reaction to the DM reaction database
   * @param reaction
   */
  addReaction(reaction) {
    let collection = this.getCollection(
      DMDatabase.Collections.REACTION
    );

    DatabaseUtil.findRemoveInsert(reaction, collection);
  }

  /**
   * Mark all the chat for a specific member as read
   */
  markChatForMemberAsRead(memberId) {
    console.log("markChatForMemberAsRead");
    let collection = this.getCollection(
      DMDatabase.Collections.MESSAGE
    );

    const results = collection.find({withMemberId: memberId, read: false});

    for (let result of results) {
      result.read = true;
      collection.update(result);
    }
  }

};
