const { ipcRenderer, remote } = window.require("electron"),
  log = remote.require("electron-log");

/*
 * This class is used as a helper class to store event names from 
 * ./public/EventManager. When adding a new event make sure to update
 * both files with the new event name. This class is also used to store
 * and register event handlers.
 */
export class EventManagerHelper {
  /*
   * static enum subclass to store event names
   */
  static get EventTypes() {
    let prefix = "metaos-ipc-";
    return {
      TEST_EVENT: prefix + "test"
    };
  }

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
 * events generated from the renderer. If there is an associated event in the main
 * process, then those callbacks will be envoked. The MainEvent property, async,
 * will fire a *-reply event back which is picked up by this classes reply function
 */
export class RendererEvent {
  constructor(eventType, caller, callback, reply) {
    this.type = eventType;
    this.caller = caller;
    this.callback = callback;
    this.reply = reply;
    this.returnValue = null;
    this.replyReturnValue = null;
    this.listenForCallback(this);
    this.listenForReply(this);
  }

  /*
   * fires the an event on the associated channel with the event.
   */
  dispatch(arg) {
    log.info("[Renderer] dispatch event -> " + this.type + " : " + arg);
    this.returnValue = null;
    try {
      this.returnValue = ipcRenderer.sendSync(this.type, arg);
      EventManagerHelper.checkEventForError(this);
      if (this.callback) {
        log.info(
          "[Renderer] callback -> " + this.type + " : " + this.returnValue
        );
        this.returnValue = this.callback(this, this.returnValue);
      }
    } catch (error) {
      this.returnValue = error;
      log.error("[Renderer] " + error.toString() + "\n\n" + error.stack + "\n");
      console.error(error.toString());
    } finally {
      return this;
    }
  }

  /*
   * sets up listeners for callback events. Usually fired from main processes. However 
   * these can also be used to communicate between renderer processes. Async flag does
   * not effect these callbacks
   */
  listenForCallback(event) {
    if (!event.callback) return;
    log.info("[Renderer] listening for callback -> " + this.type + "-reply");
    ipcRenderer.on(this.type, (_event, _arg) => {
      log.info("[Renderer] callback -> " + event.type + " : " + _arg);
      event.returnValue = null;
      try {
        event.returnValue = event.callback(_event, _arg);
      } catch (error) {
        event.returnValue = EventManagerHelper.createEventError(error, event);
        log.error(
          "[Renderer] " +
            event.returnValue.toString() +
            "\n\n" +
            event.returnValue.stack +
            "\n"
        );
        console.error(event.returnValue.toString());
      } finally {
        return event;
      }
    });
  }

  /*
   * sets up listeners for reply events. If there are more then one main process
   * events listening, then each one of those events will send an async reply, unless
   * the async flag is set on the mainevent
   */
  listenForReply(event) {
    if (!event.reply) return;
    log.info("[Renderer] listening for reply -> " + this.type + "-reply");
    ipcRenderer.on(this.type + "-reply", (_event, _arg) => {
      log.info("[Renderer] reply -> " + event.type + "-reply : " + _arg);
      event.replyReturnValue = null;
      try {
        event.replyReturnValue = event.reply(_event, _arg);
      } catch (error) {
        event.replyReturnValue = EventManagerHelper.createEventError(
          error,
          event
        );
        log.error(
          "[Renderer] " +
            event.replyReturnValue.toString() +
            "\n\n" +
            event.replyReturnValue.stack +
            "\n"
        );
        console.error(event.replyReturnValue.toString());
      } finally {
        return event;
      }
    });
  }
}
