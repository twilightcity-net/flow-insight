const { ipcRenderer, remote } = window.require("electron");
const log = remote.require("electron-log");
// const EventManager = remote.require("./EventManager");

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
    log.info("test event manager helper");
    let returnValue = ipcRenderer.sendSync(this.EventTypes.TEST_EVENT, 1);
    console.log(returnValue);

    //doesn't work right now
    if (returnValue instanceof Error) {
      console.log("we got an exception");
    }
  }
}

/*
  // Listen for async-reply message from main process
  ipcRenderer.on("async-reply", (event, arg) => {
    console.log(arg);
  });
*/
