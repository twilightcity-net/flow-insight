const { ipcMain } = require("electron"),
  log = require("electron-log"),
  WindowManager = require("./WindowManager");
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
        

        let event = this.handleCallback(this.events[i], arg);


        if (this.events[i].reply) {
          log.info("event has reply to execute : " + eventType + "-reply");
          this.events[i].executeReply(event, arg);
        }
      }
    }
  }

  /*
   * looks for events in MainEvents Array and executes their callback. Used 
   * for inter main process communication
   */
  static handleCallback(event, arg) {
    log.info("found event to execute : " + event.type);
        let _event = {
          sender: {
            send: function(_eventType, _arg) {
              this.dispatch(_eventType, _arg);
            }
          }
        };
        return event.executeCb(_event, arg);
  }

  static dispatchReply() {

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
  executeCb(event, arg) {
    if (this.active) {
      log.info("execute callback : " + this.type + " -> " + arg);
      try {
        return this.callback(event, arg);
      } catch (e) {
        if (e instanceof MainEventException) {
          log.error(
            "callback exception : " + this.type + " -> " + e.toString()
          );
          return e;
        }
        log.error("unknown callback exception: " + this.type + " -> " + e);
        return e;
      }
    }
    log.info("callback inactive : " + this.type);
    return;
  }

  /*
   * called automatically if a reply function is specified
   * arg: data object sent from the caller
   * event: the caller of this event callback
   */
  executeReply(event, arg) {
    if (this.active) {
      log.info("execute reply : " + this.type + "-reply -> " + arg);
      try {
        return this.reply(event, arg);
      } catch (e) {
        if (e instanceof MainEventException) {
          log.error(
            "reply exception : " + this.type + "-reply -> " + e.toString()
          );
          return e;
        }
        log.error("unknown reply exception: " + this.type + " -> " + e);
        return e;
      }
    }
    log.info("reply inactive : " + this.type + "-reply");
    return;
  }
}

/*
 * Generalized exception class to throw errors for MainEvent's
 */
class MainEventException {
  constructor(message) {
    this.name = "MainEventException";
    this.message = message;
  }

  toString() {
    return "[ " + this.name + " :: " + this.message + " ]";
  }
}

module.exports = { EventManager, MainEvent, MainEventException };
