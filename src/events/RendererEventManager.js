const { ipcRenderer } = window.require("electron");

/**
 * events generated from the renderer. If there is an associated event in the main
 * process, then those callbacks will be evoked. The MainEvent property, async,
 * will fire a *-reply event back which is picked up by this classes reply function
 *
 * >>>NOTE<<<
 * if a callback is provided, then there MUST be an event created in the
 * main process or the renderer will hang; like something dead.
 */
export class RendererEvent {
  constructor(eventType, scope, callback, reply) {
    this.type = eventType;
    this.scope = scope;
    this.callback = callback
      ? callback.bind(scope)
      : callback;
    this.reply = reply ? reply.bind(scope) : reply;
    this.returnValue = null;
    this.replyReturnValue = null;
    this.registerEvents();
  }

  /**
   * registers the events listeners callback and reply functions
   */
  registerEvents() {
    this.callbackWrapperFunction = RendererEventManager.listenForCallback(
      this
    );
    this.replyWrapperFunction = RendererEventManager.listenForReply(
      this
    );
  }

  /**
   * updates the listerner with a new function. pass null to remove from memory
   * @param scope
   * @param callback
   */
  updateCallback(scope, callback) {
    RendererEventManager.removeListeners(this);

    this.scope = scope;
    this.callback = callback
      ? callback.bind(scope)
      : callback;
    this.callbackWrapperFunction = RendererEventManager.listenForCallback(
      this
    );
  }

  /**
   * fires the event so that the listeners are notified
   * @param arg - the data passed
   * @param noEcho - do not use sonar .. event piping
   * @param isSync - must be set to true if using reply function
   * @returns {*}
   */
  dispatch(arg, noEcho, isSync) {
    return RendererEventManager.dispatch(
      this,
      arg,
      noEcho,
      isSync
    );
  }

  /**
   * clears our event's listeners so that they do not leak
   */
  clear() {
    this.updateCallback(this.scope, null);
  }
}

/**
 * generalize event exception class. others should extend this
 */
class EventException {
  constructor(error) {
    Error.captureStackTrace(this, EventException);
    this.name = error.name;
    this.date = new Date(error.date);
    this.event = error.event;
    this.message = error.msg;
  }

  /**
   * returns the error in string format
   * @returns {string}
   */
  toString() {
    return (
      "[ " +
      this.name +
      " :: " +
      this.event +
      " -> " +
      this.message +
      " @ " +
      this.getDateTimeString() +
      " ]"
    );
  }

  /**
   * gets the localized date time string for error reporting
   * @returns {string}
   */
  getDateTimeString() {
    return (
      this.date.toLocaleTimeString() +
      " " +
      this.date.toLocaleDateString()
    );
  }
}

/**
 * This class is used as a helper class to store event names from
 * ./public/EventManager. When adding a new event make sure to update
 * both files with the new event name. This class is also used to store
 * and register event handlers.
 */
export class RendererEventManager {
  /**
   * checks the sync return value for an exception. Required becuase the IPC
   * transport uncasts the object type, and well having all classes of type
   * object is fuckin' dumb stupid.
   * @param event
   */
  static checkEventForError(event) {
    if (!event.returnValue) {
      throw new Error("Event returned null object");
    }
    if (event.returnValue.class === "Error") {
      throw new EventException(event.returnValue);
    }
  }

  /**
   * helper function to create an EventException used for logging and debug
   * @param error
   * @param event
   * @returns {EventException}
   */
  static createEventError(error, event) {
    error.name = "EventException";
    error.date = new Date();
    error.event = event.type;
    error.msg = error.message;
    return new EventException(error);
  }

  /**
   * sets up listeners for reply events. If there are more then one main process
   * events listening, then each one of those events will send an async reply, unless
   * the async flag is set on the mainevent
   * @param event
   * @returns {wrapperFunction}
   */
  static listenForReply(event) {
    if (!event.reply) return null;

    let wrapperFunction = (_event, _arg) => {
      event.replyReturnValue = null;
      try {
        event.replyReturnValue = event.reply(_event, _arg);
      } catch (error) {
        event.replyReturnValue = RendererEventManager.createEventError(
          error,
          event
        );
        console.error(
          "[RendererEventManager] " +
            event.replyReturnValue.toString() +
            "\n\n" +
            event.replyReturnValue.stack +
            "\n"
        );
        console.error(event, _event);
        console.trace();
      }
      return event;
    };
    ipcRenderer.on(event.type + "-reply", wrapperFunction);
    return wrapperFunction;
  }

  /**
   * removes listeners from this event handler
   * @param event
   */
  static removeListeners(event) {
    if (event.callbackWrapperFunction) {
      ipcRenderer.removeListener(
        event.type,
        event.callbackWrapperFunction
      );
    }

    if (event.replyWrapperFunction) {
      ipcRenderer.removeListener(
        event.type,
        event.replyWrapperFunction
      );
    }
  }

  /**
   * ets up listeners for callback events. Usually fired from main processes. However
   * these can also be used to communicate between renderer processes. Async flag does
   * not effect these callbacks
   * @param event
   * @returns {wrapperFunction}
   */
  static listenForCallback(event) {
    if (!event.callback) return;

    let wrapperFunction = (_event, _arg) => {
      event.returnValue = null;
      try {
        event.returnValue = event.callback(_event, _arg);
      } catch (error) {
        event.returnValue = RendererEventManager.createEventError(
          error,
          event
        );
        console.error(
          "[RendererEventManager] " +
            event.returnValue.toString() +
            "\n\n" +
            event.returnValue.stack +
            "\n"
        );
        console.error(event.returnValue.toString());
      } finally {
        return event;
      }
    };

    ipcRenderer.on(event.type, wrapperFunction);
    return wrapperFunction;
  }

  /**
   * dispatches an event on the associated channel with the event. renderer events
   * will be echo'd in the main event manager, so that we can supper inter-renderer
   * communication. Only use isSync if you understand how this will block the call stack.
   * NOTE: Sending a synchronous message will block the whole renderer process,
   * unless you know what you are doing you should never use it.
   * ref => https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
   * @param event
   * @param arg
   * @param noEcho
   * @param isSync
   * @returns {*}
   */
  static dispatch(event, arg, noEcho, isSync) {
    event.returnValue = null;
    try {
      if (noEcho && isSync) {
        event.returnValue = ipcRenderer.sendSync(
          event.type,
          arg
        );
        RendererEventManager.checkEventForError(event);
        event.returnValue = event.callback(
          event,
          event.returnValue
        );
      } else if (noEcho) {
        ipcRenderer.send(event.type, arg);
      } else {
        ipcRenderer.send("echo-event", {
          type: event.type,
          arg: arg
        });
      }
    } catch (error) {
      event.returnValue = error;
      console.error(
        "[RendererEventManager] └> " +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
      console.error(error.toString());
    }
    return event;
  }
}
