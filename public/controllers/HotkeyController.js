const BaseController = require("./BaseController"),
  EventFactory = require("../events/EventFactory"),
  DatabaseFactory = require("../database/DatabaseFactory"),
  NotificationDatabase = require("../database/NotificationDatabase");
const {ShortcutManager} = require("../managers/ShortcutManager");
const AppFeatureToggle = require("../app/AppFeatureToggle");

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
        case HotkeyController.Events.GET_CURRENT_SHORTCUTS:
          this.handleGetShortcutsEvent(event, arg);
          break;
        case HotkeyController.Events.UPDATE_SHORTCUTS:
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

    arg.data = global.App.ShortcutManager.getConsoleShortcut();

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

    const consoleShortcut = global.App.ShortcutManager.getConsoleShortcut();
    const fervieShortcut = global.App.ShortcutManager.getFervieShortcut();

    const shortcuts = [];

    shortcuts.push(consoleShortcut);

    if (AppFeatureToggle.isFerviePopupEnabled) {
      shortcuts.push(fervieShortcut);
    }

    arg.data = { shortcuts: shortcuts}

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
    console.log("handleUpdateShortcutsEvent");

    let shortcuts = arg.args.shortcuts;

    let consoleShortcut = null;
    let fervieShortcut = null;
    for (let shortcut of shortcuts) {
      if (shortcut.name === ShortcutManager.Names.GLOBAL_SHOW_HIDE_CONSOLE) {
        consoleShortcut = shortcut;
      }
      if (shortcut.name === ShortcutManager.Names.GLOBAL_SHOW_HIDE_FERVIE) {
        fervieShortcut = shortcut;
      }
    }

    if (consoleShortcut) {
      let newAccelerator = this.constructAccelerator(consoleShortcut);
      console.log("new accelerator for console = "+newAccelerator);

      global.App.ShortcutManager.updateConsoleShortcut(newAccelerator);
    }

    if (fervieShortcut) {
      let newAccelerator = this.constructAccelerator(fervieShortcut);
      console.log("new accelerator for fervie = "+newAccelerator);
      global.App.ShortcutManager.updateFervieShortcut(newAccelerator);
    }

    this.delegateCallbackOrEventReplyTo(
      event,
      arg,
      callback
    );
  }
}
