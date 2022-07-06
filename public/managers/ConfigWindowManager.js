const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");

/**
 * managing class for the popup config windows
 */
module.exports = class ConfigWindowManager {

  /**
   * builds the ConfigWindowManager for the global app scope
   */
  constructor() {
    this.name = "[ConfigWindowManager]";

    this.hotkeyCloseWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_HOTKEY_CONFIG,
      this,
      (event, arg) => this.onCloseHotkeyConfigCb(event, arg)
    );

    this.hotkeyCloseWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_INVITATION_KEY,
      this,
      (event, arg) => this.onCloseInvitationKeyCb(event, arg)
    );

  }

  /**
   * When an close config window is triggered, closes the window object on the backend
   * @param event
   * @param arg
   */
  onCloseHotkeyConfigCb(event, arg) {
    WindowManagerHelper.closeWindowHotkeyConfig();
  }

  /**
   * When an close invitation key window is triggered, closes the window object on the backend
   * @param event
   * @param arg
   */
  onCloseInvitationKeyCb(event, arg) {
    WindowManagerHelper.closeWindowInvitationKey();
  }


};
