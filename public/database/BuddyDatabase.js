const LokiJS = require("lokijs"),
  Util = require("../Util"),
  DatabaseUtil = require("./DatabaseUtil");

/**
 * this class builds new buddy databases that stores buddy information
 * @type {BuddyDatabase}
 */
module.exports = class BuddyDatabase extends LokiJS {
  /**
   * the name of our database
   * @returns {string}
   * @constructor
   */
  static get Name() {
    return "buddy";
  }

  /**
   * the collections of our database
   * @constructor
   */
  static get Collections() {
    return {
      BUDDIES: "buddies",
      PENDING_REQUESTS: "pendingRequest"
    };
  }

  /**
   * the views of our database for queries
   * @constructor
   */
  static get Views() {
    return {
      BUDDIES: "buddies",
      PENDING_REQUESTS: "pendingRequest"
    };
  }

  /**
   * indices of our database so we can index things for fast queries
   * @constructor
   */
  static get Indices() {
    return {
      ID: "id",
      BUDDY_MEMBER_ID: "buddyMemberId",
      USERNAME: "username",
      TO_MEMBER_ID: "toMemberId",
    };
  }

  /**
   * builds our team database from lokijs instance
   */
  constructor() {
    super(BuddyDatabase.Name);
    this.name = "[BuddyDatabase]";
    this.guid = Util.getGuid();
    this.addCollection(BuddyDatabase.Collections.BUDDIES, {
      indices: [
        BuddyDatabase.Indices.ID,
        BuddyDatabase.Indices.BUDDY_MEMBER_ID,
        BuddyDatabase.Indices.USERNAME,
      ],
    });

    this.addCollection(BuddyDatabase.Collections.PENDING_REQUESTS, {
      indices: [
        BuddyDatabase.Indices.ID,
        BuddyDatabase.Indices.TO_MEMBER_ID,
      ],
    });

    this.getCollection(
      BuddyDatabase.Collections.BUDDIES
    ).addDynamicView(BuddyDatabase.Views.BUDDIES);

    this.getCollection(
      BuddyDatabase.Collections.PENDING_REQUESTS
    ).addDynamicView(BuddyDatabase.Views.PENDING_REQUESTS);
  }

  /**
   * gets our view for all of our buddies
   * @returns {DynamicView}
   */
  getViewForBuddies() {
    let collection = this.getCollection(
      BuddyDatabase.Collections.BUDDIES
    );
    return collection.getDynamicView(
      BuddyDatabase.Views.BUDDIES
    );
  }

  /**
   * gets our view for all of our pending buddy requests
   * @returns {DynamicView}
   */
  getViewForPendingBuddies() {
    let collection = this.getCollection(
      BuddyDatabase.Collections.PENDING_REQUESTS
    );
    return collection.getDynamicView(
      BuddyDatabase.Views.PENDING_REQUESTS
    );
  }

  /**
   * Initial load of all the buddies
   * @param buddyList
   */
  loadBuddyList(buddyList) {
    if (buddyList && buddyList.length > 0) {
      let collection = this.getCollection(
        BuddyDatabase.Collections.BUDDIES
      );

      for (let i = 0; i < buddyList.length; i++) {
        buddyList[i].id = buddyList[i].sparkId;
        DatabaseUtil.findRemoveInsert(
          buddyList[i],
          collection
        );
      }
    }
  }

  /**
   * Initial load of all the pending buddy requests
   * @param pendingRequests
   */
  loadPendingRequests(pendingRequests) {
    if (pendingRequests && pendingRequests.length > 0) {
      let collection = this.getCollection(
        BuddyDatabase.Collections.PENDING_REQUESTS
      );

      for (let i = 0; i < pendingRequests.length; i++) {
        DatabaseUtil.findRemoveInsert(
          pendingRequests[i],
          collection
        );
      }
    }
  }

  addPendingBuddyRequest(pendingBuddyRequest) {
    let collection = this.getCollection(
      BuddyDatabase.Collections.PENDING_REQUESTS
    );

    pendingBuddyRequest.id = pendingBuddyRequest.buddyRequestId;
    DatabaseUtil.findRemoveInsert(pendingBuddyRequest, collection);
  }

  /**
   * Update the properties for a buddy, like if they change their name,
   * or fervie colors
   * @param buddy
   */
  addOrUpdateBuddy(buddy) {
    let collection = this.getCollection(
      BuddyDatabase.Collections.BUDDIES
    );
    buddy.id = buddy.sparkId;

    DatabaseUtil.findRemoveInsert(buddy, collection);
  }

  /**
   * Update the properties for a buddy, like if they change their name,
   * or fervie colors
   * @param buddy
   */
  removeBuddy(buddy) {
    let collection = this.getCollection(
      BuddyDatabase.Collections.BUDDIES
    );

    buddy.id = buddy.sparkId;
    DatabaseUtil.findRemove(buddy, collection);
  }

  /**
   * Removes the buddy from the pending request list using the requestId
   * when the buddy has been added.
   * @param buddyEvent
   */
  removePendingBuddy(buddyEvent) {
    let collection = this.getCollection(
      BuddyDatabase.Collections.PENDING_REQUESTS
    );

    if (buddyEvent.buddyRequestId) {
      let result = collection.findOne({ id: buddyEvent.buddyRequestId });
      if (result) {
        collection.remove(result);
      }
    } else {
      const pendingRequests = this.getViewForPendingBuddies().data();
      for (let request of pendingRequests) {
        if (request.toMemberId === buddyEvent.buddy.sparkId) {
          collection.remove(request);
          break;
        }
      }
    }
  }

};
