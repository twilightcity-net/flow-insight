const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  NotificationDatabase = require("../database/NotificationDatabase");
const {ShortcutManager} = require("../managers/ShortcutManager");

/**
 * This class is used to manage requests for hotkey related data
 * @type {HotkeyController}
 */
module.exports = class HotkeyController extends (
  BaseController
) {
  /**
   * builds our HotkeyController class from our bass class
   * @param scope - this is the wrapping scope to execute callbacks within
   */
  constructor(scope) {
    super(scope, HotkeyController);
    if (!HotkeyController.instance) {
      HotkeyController.instance = this;
      HotkeyController.wireTogetherControllers();
    }
  }

  /**
   * general enum list of all of our possible notification events
   * @returns {{GET_CONSOLE_SHORTCUT:string, UPDATE_SHORTCUTS:string, GET_CURRENT_SHORTCUTS:string, }}
   * @constructor
   */
  static get Events() {
    return {
      UPDATE_SHORTCUTS: "update-shortcuts",
      GET_CURRENT_SHORTCUTS: "get-current-shortcuts",
      GET_CONSOLE_SHORTCUT: "get-console-shortcut"
    };
  }

  static get Modifier() {
    return {
      Control: "Control",
      Command: "Command",
      Alt: "Alt",
      CommandOrControl: "CommandOrControl",
    };
  }

  /**
   * links associated controller classes here
   */
  static wireTogetherControllers() {
    BaseController.wireControllersTo(
      HotkeyController.instance
    );
  }

  /**
   * configures application wide events here
   */
  configureEvents() {
    BaseController.configEvents(
      HotkeyController.instance
    );
    this.hotkeyClientEventListener =
      EventFactory.createEvent(
        EventFactory.Types.HOTKEY_CLIENT,
        this,
        this.onHotkeyClientEvent,
        null
      );
  }

  /**
   * notified when we get a circuit event
   * @param event
   * @param arg
   * @returns {string}
   */
  onHotkeyClientEvent(event, arg) {
    this.logRequest(this.name, arg);
    if (!arg.args) {
      this.handleError(
        HotkeyController.Error.ERROR_ARGS,
        event,
        arg
      );
    } else {
      switch (arg.type) {
        case HotkeyController.Events
          .GET_CURRENT_SHORTCUTS:
          this.handleGetShortcutsEvent(event, arg);
          break;
        case HotkeyController.Events
          .UPDATE_SHORTCUTS:
          this.handleUpdateShortcutsEvent(event, arg);
          break;
        case HotkeyController.Events.GET_CONSOLE_SHORTCUT:
          this.handleGetConsoleShortcutEvent(event, arg);
          break;
        default:
          throw new Error(
            HotkeyController.Error.UNKNOWN +
            " '" +
            arg.type +
            "'."
          );
      }
    }
  }




  /**
   * Gets console shortcut
   * @param event
   * @param arg
   * @param callback
   */
  handleGetConsoleShortcutEvent(event, arg, callback) {

    let consoleShortcut = global.App.ShortcutManager.getConsoleShortcut();

    arg.data = consoleShortcut;

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }


  /**
   * Gets all the configurable shortcuts
   * @param event
   * @param arg
   * @param callback
   */
  handleGetShortcutsEvent(event, arg, callback) {

    let consoleShortcut = global.App.ShortcutManager.getConsoleShortcut();

    arg.data = { shortcuts: [consoleShortcut]}

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }

  constructAccelerator(shortcut) {

    let accelerator = shortcut.modifier;

    if (shortcut.hasShift) {
      accelerator += "+Shift";
    }
    accelerator += "+"+shortcut.key.toUpperCase();

    return accelerator
  }

  /**
   * Update the shortcut configurations with the provided settings
   * @param event
   * @param arg
   * @param callback
   */
  handleUpdateShortcutsEvent(event, arg, callback) {
    console.log("XXX handleUpdateShortcutsEvent");

    let shortcuts = arg.args.shortcuts;

    let consoleShortcut = null;
    for (let shortcut of shortcuts) {
      if (shortcut.name === ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE) {
        consoleShortcut = shortcut;
        break;
      }
    }

    console.log("after loop");

    if (consoleShortcut) {
      let newAccelerator = this.constructAccelerator(consoleShortcut);
      console.log("XXX newAccelerator = "+newAccelerator);

      global.App.ShortcutManager.updateConsoleShortcut(newAccelerator);
    }


    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
}
