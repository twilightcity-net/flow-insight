const { ipcMain } = require("electron");
const log = require("electron-log");
/*
 * This class is used to managed the ipc events within the main process.
 * the helper class in ./src/EventManagerHelp is used to help look up
 * event names in the render process that are defined here. When creating
 * new events make sure to update both classes
 */
class EventManager {
  /*
   * Initialization method that creates an array to store events in
   */
  static init() {
    this.events = [];
  }

  /*
   * Static array containing all of our events the app uses
   */
  static get Events() {
    return this.events;
  }
  /*
   * static enum subclass to store event names. These are basically the type
   * of possible events that can be dispatched by the Manager. When adding new 
   * events make sure to update this and ./src/EventManagerHelper 
   */
  static get EventTypes() {
    let prefix = "metaos-ipc-";
    return {
      TEST_EVENT: prefix + "test"
    };
  }

  //TESTING LOGIC
  static test() {
    log.info("EventManager : test()");

    let testEventA = new MainEvent(
      this.EventTypes.TEST_EVENT,
      this,
      function(event, arg) {
        log.info("test-eventA : callback -> hello from A : " + arg);
        return arg;
      },
      null
    );
    let testEventB = new MainEvent(
      this.EventTypes.TEST_EVENT,
      this,
      function(event, arg) {
        log.info("test-eventB : callback -> hello from B : " + arg);
        return arg;
      },
      function(event, arg) {
        log.info("test-eventB : reply -> hello from B : " + arg);
        return arg;
      }
    );
    let testEventC = new MainEvent(
      this.EventTypes.TEST_EVENT,
      this,
      function(event, arg) {
        log.info("test-eventB : callback -> hello from C : " + arg);
        return arg;
      },
      function(event, arg) {
        log.info("test-eventC : reply -> hello from C : " + arg);
        return arg;
      }
    );

    this.registerEvent(testEventA);
    this.registerEvent(testEventB);
    this.registerEvent(testEventC);
    this.unregisterEvent(testEventB);

    this.dispatch(this.EventTypes.TEST_EVENT, 1); // between main processes
  }

  /*
   * adds new event into a global array to manage. There can exist multiple
   * events of the same name, and even same functions. They are referenced 
   * with variable pointers. The event should be store as a variable in the 
   * caller class
   */
  static registerEvent(mainEvent) {
    log.info("register event : " + mainEvent.type);
    this.events.push(mainEvent);
    mainEvent.listener = (event, arg) => {
      log.info("renderer event : " + mainEvent.type + " -> " + arg);
      event.returnValue = mainEvent.executeCb(event, arg);
      if (mainEvent.reply) {
        log.info("reply event : " + mainEvent.type + "-reply -> " + arg);
        event.sender.send(mainEvent.type + "-reply", event.returnValue);
      }
    };
    ipcMain.on(mainEvent.type, mainEvent.listener);
    if (mainEvent.reply) {
      mainEvent.replyListener = (event, arg) => {
        log.info(
          "renderer reply event : " + mainEvent.type + "-reply -> " + arg
        );
        event.returnValue = mainEvent.executeReply(event, arg);
      };
      ipcMain.on(mainEvent.type + "-reply", mainEvent.replyListener);
    }
  }

  /*
   * removes an event from the global events registry. The event much match
   * the pointer to it. not by the name. Returns the event that was removed.
   * A flag for active is set to false which will prevent dispatching the 
   * the event.
   */
  static unregisterEvent(event) {
    let index = this.events.indexOf(event);
    log.info("unregister event : " + event.type + " @ [" + index + "]");
    this.events.splice(index, 1);
    event.active = false;
    ipcMain.removeListener(event.type, event.listener);
    if (event.reply) {
      log.info(
        "unregister reply event : " + event.type + "-reply @ [" + index + "]"
      );
      ipcMain.removeListener(event.type + "-reply", event.replyListener);
    }
    return event;
  }

  /*
   * called to execute the event callback within main process threads
   */
  // TODO send message to all windows.. pass arg
  // TODO extend dispatch() to send event to all windows
  // window[].webContents.send("ping", 5); // Send value async to renderer process
  static dispatch(eventType, arg) {
    log.info("dispatch event : " + eventType);
    for (var i = 0; i < this.events.length; i++) {
      if (this.events[i].type === eventType) {
        log.info("found event to execute : " + eventType);
        let event = {
          sender: {
            send: function(_eventType, _arg) {
              this.dispatch(_eventType, _arg);
            }
          }
        };
        this.events[i].executeCb(event, arg);
        // if(this.events[i].reply) {
        //   log.info("found event to execute : " + eventType);
        // }
      }
    }
  }
}

/* 
 * an object class used to instantiate new event with callbacks.
 */
class MainEvent {
  /*
   * eventType: the name of the event to listen on
   * caller: parent object that created the event
   * callback: the function to dispatch
   */
  constructor(eventType, caller, callback, reply) {
    log.info("create event : " + eventType);
    this.type = eventType;
    this.caller = caller;
    this.callback = callback;
    this.reply = reply;
    this.active = true; //private
  }

  /*
   * called by the dispatch function of the Manager
   * arg: data object sent from the caller
   * event: the caller of this event callback
   */
  // TODO implement try catch for exception handling
  executeCb(event, arg) {
    if (this.active) {
      log.info("execute callback : " + this.type + " -> " + arg);
      return this.callback(event, arg);
    }
    log.info("callback inactive : " + this.type);
    return;
  }

  executeReply(event, arg) {
    if (this.active) {
      log.info("execute reply : " + this.type + "-reply -> " + arg);
      return this.reply(event, arg);
    }
    log.info("reply inactive : " + this.type + "-reply");
    return;
  }
}

module.exports = { EventManager, MainEvent };
