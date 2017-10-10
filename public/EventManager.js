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
      TEST_EVENT: prefix + "test-event"
    };
  }

  //TESTING LOGIC
  static test() {
    log.info("EventManager : test()");

    let testEventA = new MainEvent(this.Events.TEST_EVENT, true, this, function(
      event,
      arg
    ) {
      log.info("test-eventA : callback -> hello from A : " + arg);
    });
    let testEventB = new MainEvent(this.Events.TEST_EVENT, true, this, function(
      event,
      arg
    ) {
      log.info("test-eventB : callback -> hello from B : " + arg);
    });
    let testEventC = new MainEvent(this.Events.TEST_EVENT, true, this, function(
      event,
      arg
    ) {
      log.info("test-eventB : callback -> hello from C : " + arg);
    });

    this.registerEvent(testEventA);
    this.registerEvent(testEventB);
    this.registerEvent(testEventC);
    this.unregisterEvent(testEventB);

    this.dispatch(this.Events.TEST_EVENT, 1); // between main processes
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
    let listener = (_event, arg) => {
      log.info("recieved event : " + event.type + " -> " + arg);
      event.executeCb(_event, args);
    };
    event.listener = listener;
    ipcMain.on(event.type, event.listener);
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
    ipcMain.removeListener(event.type, event.listener);
    return event;
  }

  /*
   * called to execute the event callback within main process threads
   */
  // TODO send message to all windows.. pass arg
  static dispatch(eventType, arg) {
    log.info("dispatch event : " + eventType);
    for (var i = 0; i < events.length; i++) {
      if (events[i].type === eventType) {
        log.info("found event to execute : " + eventType);
        let event = {
          sender: {
            send: function(_eventType, _arg) {
              this.dispatch(_eventType, _arg);
            }
          }
        };
        events[i].executeCb(event, arg);
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
   * arg: data object sent from the caller
   * event: the caller of this event callback , can send reply
   *        event.sender.send(Event.Type, arg);
   */
  // TODO implement try catch for exception handling
  // TODO need to test reply call back functions: event.sender.send()
  executeCb(event, arg) {
    if (this.active) {
      log.info("execute callback : " + this.type + " -> " + arg);
      this.callback(event, arg);
      return true;
    }
    log.info("callback inactive : " + this.type);
    return false;
  }
}

module.exports = { EventManager, MainEvent };

// TODO extend dispatch() to send event to all windows
/*
  ipcMain.on("sync", (event, arg) => {
    console.log(arg);
    event.returnValue = 4; // Send value synchronously to renderer process
    window[].webContents.send("ping", 5); // Send value async to renderer process
  });
*/
