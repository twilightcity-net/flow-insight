const { ipcMain } = require("electron");
const log = require("electron-log");

/*
 * This class is used to managed the ipc events within the main process.
 * the helper class in ./src/EventManagerHelp is used to help look up
 * event names in the render process that are defined here. When creating
 * new events make sure to update both classes
 */
module.exports = class EventManager {
  /*
   * static enum subclass to store event names. When adding new events
   * make sure to update this and ./src/EventManagerHelper
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
    // console.log("test event manager");
    log.info("test event manager");

    // Listen for async message from renderer process
    ipcMain.on("async", (event, arg) => {
      // Print 1
      console.log(arg);
      // Reply on async message from renderer process
      event.sender.send("async-reply", 2);
    });

    // Listen for sync message from renderer process
    ipcMain.on("sync", (event, arg) => {
      // Print 3
      console.log(arg);
      // Send value synchronously back to renderer process
      event.returnValue = 4;
      // Send async message to renderer process
      // mainWindow.webContents.send("ping", 5);
    });
  }

  static pong(arg) {
    console.log(arg);
  }
};
