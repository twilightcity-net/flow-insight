
import UtilRenderer from "../UtilRenderer";

export class ActiveViewController {

  constructor(scope) {
    this.name = this.constructor.name;
    this.scope = scope;
    this.guid = UtilRenderer.getGuid();

    this.listenersByEventType = [];
  }

  listenForRefresh = (subscriber, scope, callback) => {
     this.registerListener(subscriber, "perspective-update", scope, callback);
  };

  notifyRefresh = () => {
    this.notifyListeners("perspective-update");
  };

  /**
   * Register a callback for a particular Model event type
   */
  registerListener = (subscriber, eventType, scope, callback) => {
    console.log("REGISTER: "+ subscriber + ":" + eventType);
    let eventListeners = this.listenersByEventType[eventType];

    if (eventListeners == null) {
      eventListeners = [];
      this.listenersByEventType[eventType] = eventListeners;
    }
    callback.bind(scope);
    eventListeners[subscriber] = callback;
  };

  /**
   * Unregister listeners before unmounting components
   * because the references will become invalid
   * @param subscriber
   */
  unregisterAllListeners = subscriber => {
    for (var eventType in this.listenersByEventType) {
      let eventListenersBySubscriber = this.listenersByEventType[eventType];

      let callback = eventListenersBySubscriber[subscriber];
      if (callback) {

        console.log("UNREGISTER: "+ subscriber + ":" + eventType);
        eventListenersBySubscriber[subscriber] = null;
      }
    }
  };

  /**
   * Notify all the listeners for a particular event type
   * @param eventType
   */
  notifyListeners = (eventType) => {
    let eventListenersBySubscriber = this.listenersByEventType[eventType];

    for (var subscriber in eventListenersBySubscriber) {
      let callback = eventListenersBySubscriber[subscriber];

      console.log("NOTIFY: "+ subscriber + ":" + eventType);

      if (callback) {
        callback();
      }
    }
  };

}