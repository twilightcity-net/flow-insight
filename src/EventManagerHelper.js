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

    try {
      let returnValue = ipcRenderer.sendSync(this.EventTypes.TEST_EVENT, 1);
      this.checkReturnValueForError(returnValue);
      console.log(returnValue);
    } catch (error) {
      log.error("[Renderer] " + error.toString() + "\n\n" + error.stack + "\n");
      console.error(error.toString());
    }
  }

  static checkReturnValueForError(returnValue) {
    if (!returnValue) {
      throw new Error("Event returned null object");
    }
    if (returnValue.class === "Error") {
      throw new EventException(returnValue);
    }
  }
}

export class EventException {
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

/*
  // Listen for async-reply message from main process
  ipcRenderer.on("async-reply", (event, arg) => {
    console.log(arg);
  });
*/
