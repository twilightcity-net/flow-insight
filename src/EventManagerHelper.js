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
      TEST_EVENT: prefix + "test-event"
    };
  }

  // TESTING LOGIC
  static test() {
    log.info("test event manager helper");
  }
}

// should listen for new events that have been registered

//+const remote = window.require('electron').remote;
// +const appVersion = remote.app.getVersion();

/*
// // Send async message to main process
    ipcRenderer.send("async", 1);

    // Listen for async-reply message from main process
    ipcRenderer.on("async-reply", (event, arg) => {
      // Print 2
      console.log(arg);
      // Send sync message to main process
      let mainValue = ipcRenderer.sendSync("sync", 3);
      // Print 4
      console.log(mainValue);
    });

    */
