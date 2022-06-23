const { ipcMain } = require("electron"),
  chalk = require("chalk"),
  log = require("electron-log"),
  App = require("../app/App"),
  AppError = require("../app/AppError");

/**
 * an object class used to instantiate new event with callbacks.
 */
class MainEvent {
  /**
   * builds the main event class for ipc pipe events
   * @param type the name of the event to listen on
   * @param scope parent object that created the event
   * @param callback the function to dispatch
   * @param reply the reply function to dispatch
   * @param async true to send an async message back
   */
  constructor(type, scope, callback, reply, async) {
    this.type = type;
    this.scope = scope;
    this.callback = callback
      ? callback.bind(scope)
      : callback;
    this.reply = reply ? reply.bind(scope) : reply;
    this.async = async;
    this.construct();
  }

  /**
   * fires the event associated with the event's channel.
   * @param arg
   * @returns {Array}
   */
  dispatch(arg) {
    let result = null;
    try {
      result = EventManager.dispatch(this.type, arg);
    } catch (error) {
      log.error("Error: " + error);
    }
    return result;
  }

  /**
   * sends a reply event message through the event manager
   * @param arg
   * @returns {Array}
   */
  replyTo(arg) {
    return EventManager.dispatch(this.type + "-reply", arg);
  }

  /**
   * link stuff with EventManager, and init
   */
  construct() {
    global.App.EventManager.initSender(this);
    global.App.EventManager.initReturnValues(this);
    global.App.EventManager.register(this);
  }

  /**
   * removes the event from the hive
   */
  remove() {
    EventManager.unregister(this);
  }

  /**
   * removes and clears the object from memory. warning, not reversible
   */
  destruct() {
    EventManager.destroy(this);
  }
}

/**
 * Exception class to throw errors in echo events
 */
class EventEchoException extends AppError {
  constructor(event, ...args) {
    super(...args);
    this.name = "EventEchoException";
    this.event = event;
  }
}

/**
 * Exception class to throw errors in Callback functions
 */
class EventCallbackException extends AppError {
  constructor(event, ...args) {
    super(...args);
    this.name = "EventCallbackException";
    this.event = event;
  }
}

/**
 * Error class to throw errors in Reply functions
 */
class EventReplyException extends AppError {
  constructor(event, ...args) {
    super(...args);
    this.name = "EventReplyException";
    this.event = event;
  }
}

/**
 * This class is used to managed the ipc events within the main process. the helper
 * class in ./src/EventManagerHelp is used to help look up event names in the render
 * process that are defined here. When creating new events make sure to update
 * both classes
 */
class EventManager {
  constructor() {
    log.info("[EventManager] created -> okay");
    this.events = [];
    this.initSonar();
  }

  /**
   * Static array containing all of our events the app uses
   * @returns {*}
   * @constructor
   */
  static get Events() {
    return this.events;
  }

  /**
   * creates new sender object that can dispatch the event in a feedback loop.
   * Useful for calling circular events within a state machine.
   * @param event
   */
  initSender(event) {
    event.sender = {
      send: function (_eventType, _arg) {
        global.App.EventManager.dispatch(_eventType, _arg);
      },
    };
  }

  /**
   * creates returnValues object with null values. called when dispatching a
   * new event channel
   * @param event
   */
  initReturnValues(event) {
    event.returnValues = {
      callback: null,
      reply: null,
    };
  }

  /**
   * initializes event sonar, which will reflect any echo event sent by main
   * or renderer processes. usually for renderer
   */
  initSonar() {
    log.info("[EventManager] setup event sonar");
    ipcMain.on("echo-event", (_event, _arg) => {
      let deserializedJsonEcho = JSON.parse(_arg);

      if (!deserializedJsonEcho.type) {
        throw new EventEchoException(
          "Unknown",
          new Error("Event type is not specified in arg")
        );
      }
      if (!deserializedJsonEcho.arg) {
        throw new EventEchoException(
          "Unknown",
          new Error("Event arg is missing in arg")
        );
      }
      log.info(
        "[EventManager]" +
          " sonar echo -> " +
          deserializedJsonEcho.type +
          " : " +
          JSON.stringify(deserializedJsonEcho.arg)
      );
      EventManager.dispatch(
        deserializedJsonEcho.type,
        deserializedJsonEcho.arg
      );
    });
  }

  /**
   * adds new event into a global array to manage. There can exist multiple
   * events of the same name, and even same functions. They are referenced
   * with variable pointers. The event should be store as a variable in the
   * scope class
   * @param event the scope of this event callback
   */
  register(event) {
    event = this.createListener(event);
    ipcMain.on(event.type, event.listener);
    this.events.push(event);
    log.info(
      chalk.bold.cyanBright("[EventManager]") +
        " " +
        chalk.hex("#e99e40").bold("register") +
        " -> { " +
        chalk.bold.cyanBright(event.type) +
        " }"
    );
  }

  /**
   * creates the listener for renderer events, passes event and args. Any
   * exception is caught, logged, and returned.
   * NOTE: if an event is reply based it, must be async. if not we do not
   * send an *-reply event back to the renderer. ~ZoeDreams
   * @param event
   * @returns {*}
   */
  createListener(event) {
    event.listener = (_event, _arg) => {
      let deserializedJson = JSON.parse(_arg);

      //don't log this event type for security reasons
      if (event.type !== "ipc-appactivator-save-activation") {
        log.info(
          chalk.bold.cyanBright("[EventManager]") +
          " '" +
          chalk.bold.greenBright(event.type) +
          "' " +
          " -> " +
          _arg );
      }
      try {
        let value = global.App.EventManager.executeCallback(
          event,
          deserializedJson
        );
        _event.returnValue = value;
        let serializedValue = JSON.stringify(value);
        if (event.async) {
          log.info(
            chalk.cyan("[EventManager]") +
              " reply : " +
              event.type +
              "-reply -> " +
              serializedValue
          );
          _event.sender.send(
            event.type + "-reply",
            serializedValue
          );
        }
      } catch (e) {
        log.error(
          "[EventManager] └> " +
            e.toString() +
            "\n\n" +
            e.stack +
            "\n"
        );
        _event.returnValue = e;
      }
    };
    return event;
  }

  /**
   * removes an event from the global events registry. The event much match the
   * pointer to it. not by the name. Returns the event that was removed.
   * @param event
   * @returns {*}
   */
  static unregister(event) {
    let manager = global.App.EventManager,
      events = manager.events,
      index = events.indexOf(event);

    log.info(
      chalk.cyanBright("[EventManager]") +
        " " +
        chalk.hex("#e99e40").bold("unregister") +
        " -> { " +
        chalk.cyanBright(event.type) +
        " }"
    );
    events.splice(index, 1);
    ipcMain.removeListener(event.type, event.listener);
    return event;
  }

  /**
   * removes the listeners and returns an empty object
   * @param event
   * @returns {null}
   */
  static destroy(event) {
    log.info(
      chalk.cyan("[EventManager]") +
        " " +
        chalk.hex("#e99e40").bold("destroy") +
        " -> { " +
        chalk.bold.cyanBright(event.type) +
        " }"
    );
    let manager = global.App.EventManager;
    MainEvent.unregister(event);
    for (let property in event) {
      delete event[property];
    }
    return null;
  }

  /**
   * called by the dispatch function of the Manager
   * @param event
   * @param arg
   * @returns {*}
   */
  executeCallback(event, arg) {
    try {
      if (event.callback) {
        return event.callback(event, arg);
      }
    } catch (e) {
      throw new EventCallbackException(event.type, e);
    }
  }

  /**
   * called automatically if a reply function is specified
   * @param event
   * @param arg
   * @returns {*}
   */
  executeReply(event, arg) {
    try {
      return event.reply(event, arg);
    } catch (e) {
      throw new EventReplyException(event.type, e);
    }
  }

  /**
   * called to execute the event callback within main process threads
   * @param eventType
   * @param arg
   * @returns {Array}
   */
  static dispatch(eventType, arg) {
    let windows = global.App.WindowManager.windows,
      manager = global.App.EventManager,
      returnedEvents = [];

    log.info(
      chalk.bold.cyanBright("[EventManager]") +
        " " +
        chalk.hex("#e99e40").bold("dispatch") +
        " -> { " +
        chalk.bold.cyanBright(eventType) +
        " } "
    );

    EventManager.tryToSendUpdates(windows, eventType, arg);

    for (var i = 0; i < manager.events.length; i++) {
      if (manager.events[i].type === eventType) {
        returnedEvents.push(
          manager.handleEvent(manager.events[i], arg)
        );
      }
    }

    if (
      returnedEvents.length === 0 &&
      windows.length === 0
    ) {
      log.info(
        chalk.cyan("[EventManager]") +
          " └> no events found -> " +
          eventType
      );
      return [];
    }

    return returnedEvents;
  }

  static tryToSendUpdates(windows, eventType, arg) {
    let jsonArg = JSON.stringify(arg);
    for (let j = 0; j < windows.length; j++) {
      try {
        windows[j].window.webContents.send(
          eventType,
          jsonArg
        );
      } catch (error) {
        log.error("Error while sending event to window "+windows[j].name + jsonArg);
      }
    }
  }

  /**
   * handles the event dispatching by evoking the callback and reply functions
   * @param event
   * @param arg
   * @returns {*}
   */
  handleEvent(event, arg) {
    this.initReturnValues(event);
    try {
      event.returnValues.callback = this.executeCallback(
        event,
        arg
      );
      if (event.reply) {
        event.returnValues.reply = this.executeReply(
          event,
          arg
        );
      }
    } catch (error) {
      if (error instanceof EventCallbackException) {
        event.returnValues.callback = error;
      } else if (error instanceof EventReplyException) {
        event.returnValues.reply = error;
      }
      log.error(
        "[EventManager] └> { " +
          error.event +
          " } -> " +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
      AppError.handleError(error, false);
    }
    return event;
  }
}

/**
 * class exports for browserify
 * @type {{EventCallbackException: *, EventManager: *, EventEchoException: *, MainEvent: *, EventReplyException: *}}
 */
module.exports = {
  EventManager,
  MainEvent,
  EventEchoException,
  EventCallbackException,
  EventReplyException,
};
