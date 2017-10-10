const { ipcMain } = require("electron");
const log = require("electron-log");

/*
 * An array containing all of our global events that have been registered
 */
const events = [];

/*
 * This class is used to managed the ipc events within the main process.
 * the helper class in ./src/EventManagerHelp is used to help look up
 * event names in the render process that are defined here. When creating
 * new events make sure to update both classes
 */
class EventManager {
  /*
   * static enum subclass to store event names. These are basically the type
   * of possible events that can be dispatched by the Manager. When adding new 
   * events make sure to update this and ./src/EventManagerHelper 
   */
  static get Events() {
    let prefix = "metaos-ipc-";
    return {
      ASYNC: prefix + "async",
      SYNC: prefix + "sync",
      ASYNC_REPLY: prefix + "async-reply",
      PING: prefix + "ping",
      TEST_EVENT: prefix + "test-event"
    };
  }

  //TESTING LOGIC
  static test() {
    log.info("EventManager : test()");

    let testEventA = new MainEvent(
      this.Events.TEST_EVENT,
      true,
      this,
      function() {
        log.info("test-eventA : callback -> hello from A");
      }
    );
    let testEventB = new MainEvent(
      this.Events.TEST_EVENT,
      true,
      this,
      function() {
        log.info("test-eventB : callback -> hello from B");
      }
    );
    let testEventC = new MainEvent(
      this.Events.TEST_EVENT,
      true,
      this,
      function() {
        log.info("test-eventB : callback -> hello from C");
      }
    );

    this.registerEvent(testEventA);
    this.registerEvent(testEventB);
    this.registerEvent(testEventC);
    this.unregisterEvent(testEventB);

    //testing
    testEventA.dispatch();
    testEventB.dispatch();
    testEventC.dispatch();
  }

  /*
   * adds new event into a global array to manage. There can exist multiple
   * events of the same name, and even same functions. They are referenced 
   * with variable pointers. The event should be store as a variable in the 
   * caller class
   */
  static registerEvent(event) {
    log.info("register event : " + event.type);
    events.push(event);
  }

  /*
   * removes an event from the global events registry. The event much match
   * the pointer to it. not by the name. Returns the event that was removed.
   * A flag for active is set to false which will prevent dispatching the 
   * the event.
   */
  static unregisterEvent(event) {
    let index = events.indexOf(event);
    log.info("unregister event : " + event.type + " @ [" + index + "]");
    events.splice(index, 1);
    event.active = false;
    return event;
  }
}

/* 
 * an object class used to instantiate new event with callbacks.
 */
class MainEvent {
  /*
   * eventType: the name of the event to listen on
   * isAsync: dispatch the event async
   * caller: parent object that created the event
   * callback: the function to dispatch
   */
  constructor(eventType, isAsync, caller, callback) {
    log.info("create event : " + eventType);
    this.type = eventType;
    this.async = isAsync;
    this.caller = caller;
    this.callback = callback;
    this.active = true; //private
  }

  /*
   * called by the dispatch function of the Manager
   */
  // TODO implement try catch for exception handling
  execute() {
    if (this.active) {
      log.info("execute callback : " + this.type);
      this.callback();
      return true;
    }
    log.info("callback inactive : " + this.type);
    return false;
  }

  /*
   * called by the manager to execute the event callback
   */
  dispatch() {
    log.info("dispatch event : " + this.type);
    this.execute();
  }
}

module.exports = { EventManager, MainEvent };

/*
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

  */
