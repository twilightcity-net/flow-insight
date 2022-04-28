const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new notification database that stores notifications received over talk
 * @type {NotificationDatabase}
 */
module.exports = class NotificationDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "notification";
  }

  /**
   * the collections of our database
   * @returns {{PAIR_REQUEST:string, NOTIFICATION: string}}
   * @constructor
   */
  static get Collections() {
    return {
      NOTIFICATION: "notification",
      PAIR_REQUEST: "pair-request"
    };
  }

  /**
   * the views of our database for queries
   * @returns {{ALL_PAIR_REQUEST:string, UNREAD_NOTIFICATION:string, ALL_NOTIFICATION: string}}
   * @constructor
   */
  static get Views() {
    return {
      ALL_NOTIFICATION: "all-notification",
      UNREAD_NOTIFICATION: "unread-notification",
      ALL_PAIR_REQUEST: "all-pair-request"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @returns {{TO_MEMBER_ID:string, READ:string, ID: string, TYPE: string}}
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      TYPE: "type",
      READ: "read"
    };
  }

  /**
   * builds our dictionary database from lokijs instance
   */
  constructor() {
    super(NotificationDatabase.Name);
    this.name = "[NotificationDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(
      NotificationDatabase.Collections.NOTIFICATION,
      {
        indices: [
          NotificationDatabase.Indices.ID,
          NotificationDatabase.Indices.TYPE,
          NotificationDatabase.Indices.READ
        ],
      }
    );

    this.addCollection(
      NotificationDatabase.Collections.PAIR_REQUEST,
      {
        indices: [
          NotificationDatabase.Indices.ID
        ],
      }
    );

    let allPairRequestView = this.getCollection(
      NotificationDatabase.Collections.PAIR_REQUEST
    ).addDynamicView(NotificationDatabase.Views.ALL_PAIR_REQUEST);

    let allNotificationView = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    ).addDynamicView(NotificationDatabase.Views.ALL_NOTIFICATION);

    allNotificationView.applySort(function (obj1, obj2) {
      if (obj1.timestamp === obj2.timestamp) return 0;
      if (obj1.timestamp > obj2.timestamp) return 1;
      if (obj1.timestamp < obj2.timestamp) return -1;
    });

    let unreadNotificationView = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    ).addDynamicView(NotificationDatabase.Views.UNREAD_NOTIFICATION);

    unreadNotificationView.applyFind({
      read: false,
    });
  }

  /**
   * gets our view for all of our pairing requests
   * @returns {DynamicView}
   */
  getViewForPairingRequests() {
    let collection = this.getCollection(
      NotificationDatabase.Collections.PAIR_REQUEST
    );
    return collection.getDynamicView(
      NotificationDatabase.Views.ALL_PAIR_REQUEST
    );
  }


  /**
   * gets our view for all of our notifications
   * @returns {DynamicView}
   */
  getViewForNotifications() {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );
    return collection.getDynamicView(
      NotificationDatabase.Views.ALL_NOTIFICATION
    );
  }

  /**
   * gets our view for our unread notifications
   * @returns {DynamicView}
   */
  getViewForUnreadNotifications() {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );
    return collection.getDynamicView(
      NotificationDatabase.Views.UNREAD_NOTIFICATION
    );
  }

  /**
   * Add a new pair request to our local DB
   * @param toMemberId
   */
  addPairRequest(toMemberId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.PAIR_REQUEST
    );

    let pairRequest = {id: toMemberId};

    DatabaseUtil.findRemoveInsert(pairRequest, collection);
  }

  /**
   * Remove a pair request from our local DB
   * @param toMemberId
   */
  removePairRequest(toMemberId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.PAIR_REQUEST
    );

    let pairRequest = {id: toMemberId};

    DatabaseUtil.findRemove(pairRequest, collection);
  }

  /**
   * Returns true if a pair request exists for this member
   * @param toMemberId
   */
  hasPairRequest(toMemberId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.PAIR_REQUEST
    );

    let result = collection.findOne({ id: toMemberId });
    return !!result;
  }

  /**
   * Add a new notification to our local DB
   * @param notificationObj
   */
  addNotification(notificationObj) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );

    DatabaseUtil.findRemoveInsert(notificationObj, collection);
  }

  /**
   * Add a new notification to our local DB
   * @param messageType
   * @param fromMemberId
   */
  cancelNotification(messageType, fromMemberId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );

    let result = collection.findOne({type: messageType, fromMemberId: fromMemberId, canceled: false});
    if (result) {
      result.canceled = true;
      collection.update(result);
    }
  }

  /**
   * Delete a notification from our local DB
   * @param notificationId
   */
  deleteNotificationById(notificationId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );

    DatabaseUtil.findRemove({id: notificationId}, collection);
  }

  /**
   * Marks a notification from our local DB as read
   * @param notificationId
   */
  markRead(notificationId) {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );

    let result = collection.findOne({ id: notificationId });
    if (result) {
      result.read = true;
      collection.update(result);
    }
  }

  /**
   * Marks all notification from our local DB as read
   */
  markAllAsRead() {
    let collection = this.getCollection(
      NotificationDatabase.Collections.NOTIFICATION
    );

    let view = collection.getDynamicView(
      NotificationDatabase.Views.UNREAD_NOTIFICATION
    );

    let notifications = view.data();
    for (let i = 0; i < notifications.length; i++) {
      let record = notifications[i];
      record.read = true;
      collection.update(record);
    }

  }

};
