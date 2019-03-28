const { ipcRenderer, remote } = window.require("electron"),
  log = remote.require("electron-log");

/*
 * events generated from the renderer. If there is an associated event in the main
 * process, then those callbacks will be envoked. The MainEvent property, async,
 * will fire a *-reply event back which is picked up by this classes reply function
 *
 * ***NOTE***: if a callback is provided, then there MUST be an event created in the
 * main process or the renderer will hang
 */
export class RendererEvent {
  constructor(eventType, scope, callback, reply) {
    this.type = eventType;
    this.scope = scope;
    this.callback = callback ? callback.bind(scope) : callback;

    this.reply = reply;
    this.returnValue = null;
    this.replyReturnValue = null;

    this.registerEvents();
  }

  registerEvents() {
    this.callbackWrapperFunction = RendererEventManager.listenForCallback(this);
    this.replyWrapperFunction = RendererEventManager.listenForReply(this);
  }

  updateCallback(scope, callback) {
    RendererEventManager.removeListeners(this);

    this.scope = scope;
    this.callback = callback ? callback.bind(scope) : callback;
    this.callbackWrapperFunction = RendererEventManager.listenForCallback(this);
  }

  dispatch(arg, noEcho, isSync) {
    return RendererEventManager.dispatch(this, arg, noEcho, isSync);
  }
}

/*
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

  /*
   * returns the error in string format
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

  /*
   * gets the localized date time string for error reporting
   */
  getDateTimeString() {
    return (
      this.date.toLocaleTimeString() + " " + this.date.toLocaleDateString()
    );
  }
}

/*
 * This class is used as a helper class to store event names from
 * ./public/EventManager. When adding a new event make sure to update
 * both files with the new event name. This class is also used to store
 * and register event handlers.
 */
export class RendererEventManager {
  /*
   * checks the sync return value for an exception. Required becuase the IPC
   * transport uncasts the object type, and well having all classes of type
   * object is fuckin' dumb stupid.
   */
  static checkEventForError(event) {
    if (!event.returnValue) {
      throw new Error("Event returned null object");
    }
    if (event.returnValue.class === "Error") {
      throw new EventException(event.returnValue);
    }
  }

  /*
   * helper function to create an EventException used for logging and debug
   */
  static createEventError(error, event) {
    error.name = "EventException";
    error.date = new Date();
    error.event = event.type;
    error.msg = error.message;
    return new EventException(error);
  }

  /*
   * sets up listeners for reply events. If there are more then one main process
   * events listening, then each one of those events will send an async reply, unless
   * the async flag is set on the mainevent
   */
  static listenForReply(event) {
    if (!event.reply) return;
    log.info(
      "[RendererEventManager] listening for reply -> " + event.type + "-reply"
    );

    let wrapperFunction = (_event, _arg) => {
      event.replyReturnValue = null;
      try {
        log.info(
          "[RendererEventManager] event reply -> " +
            event.type +
            "-reply : " +
            _arg
        );
        event.replyReturnValue = event.reply(_event, _arg);
      } catch (error) {
        event.replyReturnValue = RendererEventManager.createEventError(
          error,
          event
        );
        log.error(
          "[RendererEventManager] " +
            event.replyReturnValue.toString() +
            "\n\n" +
            event.replyReturnValue.stack +
            "\n"
        );
        console.error(event.replyReturnValue.toString());
      } finally {
        return event;
      }
    };
    ipcRenderer.on(event.type + "-reply", wrapperFunction);
    return wrapperFunction;
  }

  static removeListeners(event) {
    log.info(
      "[RendererEventManager] removing listeners for callback -> " + event.type
    );
    if (event.callbackWrapperFunction) {
      ipcRenderer.removeListener(event.type, event.callbackWrapperFunction);
    }

    if (event.replyWrapperFunction) {
      ipcRenderer.removeListener(event.type, event.replyWrapperFunction);
    }
  }

  /*
   * sets up listeners for callback events. Usually fired from main processes. However
   * these can also be used to communicate between renderer processes. Async flag does
   * not effect these callbacks
   */
  static listenForCallback(event) {
    if (!event.callback) return;
    log.info("[RendererEventManager] listening for callback -> " + event.type);

    let wrapperFunction = (_event, _arg) => {
      event.returnValue = null;
      try {
        log.info(
          "[RendererEventManager] event callback -> " +
            event.type +
            " : " +
            _arg
        );
        event.returnValue = event.callback(_event, _arg);
      } catch (error) {
        event.returnValue = RendererEventManager.createEventError(error, event);
        log.error(
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

  /// dispatches an event on the associated channel with the event. renderer events
  /// will be echo'd in the main event manager, so that we can supper inter-renderer
  /// communication. Only use isSync if you understand how this will block the call stack.
  /// Note: Sending a synchronous message will block the whole renderer process,
  /// unless you know what you are doing you should never use it.
  /// ref => https://github.com/electron/electron/blob/master/docs/api/ipc-renderer.md
  static dispatch(event, arg, noEcho, isSync) {
    event.returnValue = null;
    log.info(
      "[RendererEventManager] dispatch event -> " + event.type + " : " + arg
    );
    try {
      if (noEcho && isSync) {
        log.info(
          "[RendererEventManager] |> send sync event -> " +
            event.type +
            " : " +
            arg
        );
        event.returnValue = ipcRenderer.sendSync(event.type, arg);
        RendererEventManager.checkEventForError(event);
        log.info(
          "[RendererEventManager] └> callback -> " +
            event.type +
            " : " +
            event.returnValue
        );
        event.returnValue = event.callback(event, event.returnValue);
      } else if (noEcho) {
        log.info(
          "[RendererEventManager] └> send event -> " + event.type + " : " + arg
        );
        ipcRenderer.send(event.type, arg);
      } else {
        log.info(
          "[RendererEventManager] └> send echo event -> " +
            event.type +
            " : " +
            arg
        );
        ipcRenderer.send("echo-event", { type: event.type, arg: arg });
      }
    } catch (error) {
      event.returnValue = error;
      log.error(
        "[RendererEventManager] └> " +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
      console.error(error.toString());
    } finally {
      return event;
    }
  }
}
