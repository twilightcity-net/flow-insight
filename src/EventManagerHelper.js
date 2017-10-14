const { ipcRenderer, remote } = window.require("electron");
const log = remote.require("electron-log");

/*
 * This class is used as a helper class to store event names from 
 * ./public/EventManager. When adding a new event make sure to update
 * both files with the new event name. This class is also used to store
 * and register event handlers.
 */
export default class EventManagerHelper {
  /*
   * static enum subclass to store event names
   */
  static get EventTypes() {
    let prefix = "metaos-ipc-";
    return {
      TEST_EVENT: prefix + "test"
    };
  }

  // TESTING LOGIC
  static test() {
    console.log("test event manager helper");

    let rendererEvent = new RendererEvent(
      EventManagerHelper.EventTypes.TEST_EVENT,
      this,
      function(event, arg) {
        log.info("[Renderer] test-eventD : callback -> hello from D : " + arg);
        return arg;
      }
    );

    try {
      rendererEvent = rendererEvent.dispatch(1);
      console.log(rendererEvent);
    } catch (error) {
      log.error("[Renderer] " + error.toString() + "\n\n" + error.stack + "\n");
      console.error(error.toString());
    }
  }

  static checkEventForError(event) {
    if (!event.returnValue) {
      throw new Error("Event returned null object");
    }
    if (event.returnValue.class === "Error") {
      throw new EventException(event.returnValue);
    }
  }
}

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

  getDateTimeString() {
    return (
      this.date.toLocaleTimeString() + " " + this.date.toLocaleDateString()
    );
  }
}

export class RendererEvent {
  constructor(eventType, caller, callback) {
    this.type = eventType;
    this.caller = caller;
    this.callback = callback;
    this.returnValue = null;
  }

  dispatch(arg) {
    log.info("[Renderer] dispatch event -> " + this.type + " : " + arg);
    this.returnValue = null;
    this.returnValue = ipcRenderer.sendSync(this.type, arg);

    EventManagerHelper.checkEventForError(this);

    if (this.callback) {
      log.info(
        "[Renderer] execute callback -> " + this.type + " : " + this.returnValue
      );
      this.returnValue = this.callback(this, this.returnValue);
    }
    return this;
  }
}

/*
  // Listen for async-reply message from main process
  ipcRenderer.on("async-reply", (event, arg) => {
    console.log(arg);
  });
*/
