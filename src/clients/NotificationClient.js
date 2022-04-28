import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our notification service
 */
export class NotificationClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * builds the Client for the Notifications in our local DB
   * @param scope
   */
  constructor(scope) {
    super(scope, "[NotificationClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.NOTIFICATION_CLIENT,
      this,
      null,
      this.onNotificationEventReply
    );
  }

  /**
   * general enum list of all of our possible notification events
   * @returns {{MARK_ALL_NOTIFICATION_AS_READ:string, MARK_NOTIFICATION_AS_READ:string, DELETE_NOTIFICATION: string, GET_NOTIFICATION_COUNT: string, GET_NOTIFICATIONS: string}}
   * @constructor
   */
  static get Events() {
    return {
      GET_NOTIFICATION_COUNT: "get-notification-count",
      GET_NOTIFICATIONS: "get-notifications",
      DELETE_NOTIFICATION: "delete-notification",
      MARK_NOTIFICATION_AS_READ: "mark-notification-as-read",
      MARK_ALL_NOTIFICATION_AS_READ: "mark-all-notification-as-read"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!NotificationClient.instance) {
      NotificationClient.instance = new NotificationClient(
        scope
      );
    }
  }

  /**
   * gets all our available notifications from the local DB
   * for display in the UI, in time sorted order
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getNotifications(scope, callback) {
    let event = NotificationClient.instance.createClientEvent(
      NotificationClient.Events.GET_NOTIFICATIONS,
      {},
      scope,
      callback
    );
    NotificationClient.instance.notifyNotification(event);
    return event;
  }


  /**
   * gets the count of our unread notifications so we know
   * whether to display the little alert dot
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static getUnreadNotificationCount(scope, callback) {
    let event = NotificationClient.instance.createClientEvent(
      NotificationClient.Events.GET_NOTIFICATION_COUNT,
      {},
      scope,
      callback
    );
    NotificationClient.instance.notifyNotification(event);
    return event;
  }

  /**
   * Deletes a specific notification once it's been dealt with
   * @param notificationId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static deleteNotification(notificationId, scope, callback) {
    let event = NotificationClient.instance.createClientEvent(
      NotificationClient.Events.DELETE_NOTIFICATION,
      {id : notificationId},
      scope,
      callback
    );
    NotificationClient.instance.notifyNotification(event);
    return event;
  }


  /**
   * Marks a specific notification as read
   * @param notificationId
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static markAsRead(notificationId, scope, callback) {
    let event = NotificationClient.instance.createClientEvent(
      NotificationClient.Events.MARK_NOTIFICATION_AS_READ,
      {id : notificationId},
      scope,
      callback
    );
    NotificationClient.instance.notifyNotification(event);
    return event;
  }


  /**
   * Marks a specific notification as read
   * @param scope
   * @param callback
   * @returns {RendererClientEvent}
   */
  static markAllAsRead(scope, callback) {
    let event = NotificationClient.instance.createClientEvent(
      NotificationClient.Events.MARK_ALL_NOTIFICATION_AS_READ,
      {},
      scope,
      callback
    );
    NotificationClient.instance.notifyNotification(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onNotificationEventReply = (event, arg) => {
    let clientEvent = NotificationClient.replies.get(arg.id);
    this.logReply(
      NotificationClient.name,
      NotificationClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      NotificationClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process team that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyNotification(clientEvent) {
    console.log(
      "[" +
        NotificationClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    NotificationClient.replies.set(
      clientEvent.id,
      clientEvent
    );
    this.event.dispatch(clientEvent, true);
  }
}
