import UtilRenderer from "../UtilRenderer";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * this base class is used by object models that retrieve data from
 * corresponding DataStores in the main process of the application
 */
export class DataModel {
  /**
   * this is a hardcoded buffer using an async setTimeout function. This
   * is helpful when adjusting for animation buffering and lag. This is
   * the amount of milliseconds to delay the async callback
   * @type {number}
   */
  static activeWaitDelay = 100;

  /**
   * builds the datamodel based on the child's calling call. this is the
   * scope to execute the model within
   * @param scope
   */
  constructor(scope) {
    this.name = this.constructor.name;
    this.scope = scope;
    this.context = scope.constructor.name;
    this.guid = UtilRenderer.getGuid();
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.DATASTORE_LOAD,
        this
      ),
      loaded: RendererEventFactory.createEvent(
        RendererEventFactory.Events.DATASTORE_LOADED,
        this,
        this.onLoadedCb
      )
    };

    this.listenersByEventType = [];
  }

  /**
   * Register a callback for a particular Model event type
   * @param subscriber - the function whichs wishes to be notified in event of
   * @param eventType - the namespace channel name of the event to be notified by
   * @param callback - the function to execute when notified
   */
  registerListener = (subscriber, eventType, callback) => {
    let eventListeners = this.listenersByEventType[eventType];

    if (eventListeners == null) {
      eventListeners = [];
      this.listenersByEventType[eventType] = eventListeners;
    }

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
        eventListenersBySubscriber[subscriber] = null;
      }
    }
  };

  /**
   * Notify all the listeners for a particular event type
   * @param eventType
   */
  notifyListeners(eventType) {
    let eventListenersBySubscriber = this.listenersByEventType[eventType];

    for (var subscriber in eventListenersBySubscriber) {
      let callback = eventListenersBySubscriber[subscriber];

      if (callback) {
        callback.call(this.scope);
      }
    }
  }

  /**
   * Makes a remote fetch call to populate the model, useing a shared event bus, so the calls must
   * essentially be synchronous, otherwise the fetch will return an error.
   *
   * Returns the data results, and any errors to the caller
   *
   * @param remoteArgs
   * @param remoteUrn
   * @param loadRequestType
   * @param dtoClass
   * @param callback (dtoResults, error)
   */
  remoteFetch(remoteArgs, remoteUrn, loadRequestType, dtoClass, callback) {
    if (this.callInProgress === true) {
      callback(
        null,
        "[DataModel] remoteFetch -> Call already in progress : " + remoteUrn
      );
    }

    this.callInProgress = true;

    this.dtoClass = dtoClass;
    this.callback = callback;
    this.timestamp = new Date().getTime();

    console.log("[DataModel] call -> " + loadRequestType + " : " + remoteUrn);
    this.events.load.dispatch(
      {
        name: this.name,
        context: this.context,
        guid: this.guid,
        timestamp: this.timestamp,
        dto: remoteArgs,
        urn: remoteUrn,
        requestType: loadRequestType
      },
      true
    );
  }

  /**
   * event callback for the load event of the data model
   * @param event - the event name that is notified from
   * @param arg - the data returned by the event circuit
   */
  onLoadedCb(event, arg) {
    if (
      arg.name !== this.name ||
      arg.context !== this.context ||
      arg.guid !== this.guid
    ) {
      return;
    }

    let dtoResults = null;
    if (!arg.error) {
      if (Array.isArray(arg.data)) {
        dtoResults = [];
        for (var i in arg.data) {
          dtoResults[i] = new this.dtoClass(arg.data[i]);
        }
      } else if (!UtilRenderer.isObjEmpty(arg.data)) {
        dtoResults = new this.dtoClass(arg.data);
      }

      this.callInProgress = false;
      this.callback(dtoResults, arg.error);
    } else {
      this.callInProgress = false;
    }
  }

  /**
   * enum class of all of http requests
   * @returns {{POST: string, GET: string}}
   * @constructor - static constructor for the possible types of requests
   */
  static get RequestTypes() {
    return {
      POST: "post",
      GET: "get"
    };
  }
}
