import { ipcRenderer, remote } from "electron";
//const remote = window.require('electron').remote;

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
  static get EventNames() {
    let prefix = "metaos-ipc-";
    return {
      ASYNC: prefix + "async",
      SYNC: prefix + "sync",
      ASYNC_REPLY: prefix + "async-reply",
      PING: prefix + "ping"
    };
  }

  static test() {
    console.log("test event manager helper");
    var { ipcRenderer, remote } = require("electron");
    var main = remote.require("./main.js");

    // Send async message to main process
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

    // Listen for main message
    ipcRenderer.on("ping", (event, arg) => {
      // Print 5
      console.log(arg);
      // Invoke method directly on main process
      main.pong(6);
    });
  }
}
