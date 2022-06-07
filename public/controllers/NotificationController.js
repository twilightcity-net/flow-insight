const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  NotificationDatabase = require("../database/NotificationDatabase");

/**
 * This class is used to manage requests for notifications data
 * @type {NotificationController}
 */
module.exports = class NotificationController extends (
  BaseController
) {
  /**
   * builds our Notification controller class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, NotificationController);
    if (!NotificationController.instance) {
      NotificationController.instance = this;
      NotificationController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible notification events
   * @constructor
   */
  static get Events() {
    return {
      GET_NOTIFICATION_COUNT: "get-notification-count",
      GET_NOTIFICATIONS: "get-notifications",
      DELETE_NOTIFICATION: "delete-notification",
      MARK_NOTIFICATION_AS_READ:
        "mark-notification-as-read",
      MARK_ALL_NOTIFICATION_AS_READ:
        "mark-all-notification-as-read",
      GET_NOTIFICATION_OF_TYPE_FOR_USER:
        "get-notification-of-type-for-user",
      LOAD_NOTIFICATIONS: "load-notifications"
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      NotificationController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      NotificationController.instance
    );
    this.notificationClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.NOTIFICATION_CLIENT,
        this,
        this.onNotificationClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onNotificationClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        NotificationController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case NotificationController.Events
          .GET_NOTIFICATIONS:
          this.handleGetNotificationsEvent(event, arg);
          break;
        case NotificationController.Events
          .LOAD_NOTIFICATIONS:
          this.handleLoadNotificationsEvent(event, arg);
          break;
        case NotificationController.Events
          .GET_NOTIFICATION_COUNT:
          this.handleGetNotificationsCountEvent(event, arg);
          break;
        case NotificationController.Events
          .DELETE_NOTIFICATION:
          this.handleDeleteNotificationEvent(event, arg);
          break;
        case NotificationController.Events
          .MARK_NOTIFICATION_AS_READ:
          this.handleMarkNotificationAsReadEvent(
            event,
            arg
          );
          break;
        case NotificationController.Events
          .MARK_ALL_NOTIFICATION_AS_READ:
          this.handleMarkAllNotificationAsReadEvent(
            event,
            arg
          );
          break;
        case NotificationController.Events
          .GET_NOTIFICATION_OF_TYPE_FOR_USER:
          this.handleGetNotificationOfTypeForUserEvent(
            event,
            arg
          );
          break;
        default:
          throw new Error(
            NotificationController.Error.UNKNOWN +
              " '" +
              arg.type +
              "'."
          );
      }
    }
  }

  /**
   * Gets all the available notifications, sorted by timestamp (by the view)
   * @param event
   * @param arg
   * @param callback
   */
  handleGetNotificationsEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    let view = database.getViewForNotifications();
    arg.data = view.data();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Loads all the persistent notifications from the server into the local DB
   * @param event
   * @param arg
   * @param callback
   */
  handleLoadNotificationsEvent(event, arg, callback) {
    let urn =
        NotificationController.Paths.NOTIFICATION;

    this.doClientRequest(
      NotificationController.Contexts.NOTIFICATION_CLIENT,
      {},
      NotificationController.Names.GET_NOTIFICATIONS,
      NotificationController.Types.GET,
      urn,
      (store) =>
        this.loadNotificationsToDB(
          store,
          event,
          arg,
          callback
        )
    );

  }



  /**
   * callback delegator which processes our return from the dto
   * request to gridtime
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  loadNotificationsToDB(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    for (let notification of arg.data) {
      database.addNotification(
        {
          id: notification.id,
          type: notification.notificationType,
          timestamp: notification.createdDate,
          fromMemberId: notification.fromMemberId,
          fromUsername: notification.fromUsername,
          read: notification.isRead,
          canceled: false,
          data: notification,
        }
      )
    }

    let view = database.getViewForNotifications();
    arg.data = view.data();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );

  }


  /**
   * Deletes a specific notification from the local store
   * @param event
   * @param arg
   * @param callback
   */
  handleDeleteNotificationEvent(event, arg, callback) {
    let notificationId = arg.args.id;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    database.deleteNotificationById(notificationId);

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Marks a specific notification from the local store as read
   * @param event
   * @param arg
   * @param callback
   */
  handleMarkNotificationAsReadEvent(event, arg, callback) {
    let notificationId = arg.args.id;

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    database.markRead(notificationId);



    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Marks all notifications from the local store as read
   * @param event
   * @param arg
   * @param callback
   */
  handleMarkAllNotificationAsReadEvent(
    event,
    arg,
    callback
  ) {
    let urn =
      NotificationController.Paths.NOTIFICATION +
      NotificationController.Paths.MARK +
      NotificationController.Paths.READ;

    this.doClientRequest(
      NotificationController.Contexts.NOTIFICATION_CLIENT,
      {},
      NotificationController.Names.MARK_NOTIFICATIONS_AS_READ,
      NotificationController.Types.POST,
      urn,
      (store) =>
        this.markNotificationsAsReadInDB(
          store,
          event,
          arg,
          callback
        )
    );

  }


  /**
   * callback which updates the DB read property
   * @param store
   * @param event
   * @param arg
   * @param callback
   */
  markNotificationsAsReadInDB(store, event, arg, callback) {
    if (store.error) {
      arg.error = store.error;
    } else {
      arg.data = store.data;
    }

    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    database.markAllAsRead();

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );

  }

  /**
   * Get the number of notifications used for determining whether to show the dot
   * @param event
   * @param arg
   * @param callback
   */
  handleGetNotificationsCountEvent(event, arg, callback) {
    let database = DatabaseFactory.getDatabase(
      DatabaseFactory.Names.NOTIFICATION
    );

    let view = database.getViewForUnreadNotifications();
    let count = view.count();
    arg.data = { count: count };

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  /**
   * Get notification of a particular type from a particular user
   * @param event
   * @param arg
   * @param callback
   */
  handleGetNotificationOfTypeForUserEvent(
    event,
    arg,
    callback
  ) {
    let username = arg.args.username,
      type = arg.args.type,
      database = DatabaseFactory.getDatabase(
        DatabaseFactory.Names.NOTIFICATION
      );

    let result = database.findByUserAndType(username, type);
    arg.data = result;

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
};
