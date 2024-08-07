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
    this.orgSwitcherCloseWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_ORG_SWITCHER,
      this,
      (event, arg) => this.onCloseOrgSwitcherCb(event, arg)
    );

    this.pluginDialogCloseWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_PLUGIN_DIALOG,
      this,
      (event, arg) => this.onClosePluginDialogCb(event, arg)
    );

    this.pluginDialogCloseWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_MODULE_DIALOG,
      this,
      (event, arg) => this.onCloseModuleDialogCb(event, arg)
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


  /**
   * When a close org switcher window is triggered, close the window object on the backend,
   * usually by clicking the X
   * @param event
   * @param arg
   */
  onCloseOrgSwitcherCb(event, arg) {
    WindowManagerHelper.closeWindowOrgSwitch();
  }

  /**
   * When a close event for the plugin dialog is triggered, close the window object on the backend
   * usually by clicking the X, or the cancel button
   * @param event
   * @param arg
   */
  onClosePluginDialogCb(event, arg) {
    WindowManagerHelper.closeWindowPluginDialog();
  }

  /**
   * When a close event for the load module config dialog is triggered, close the window object on the backend
   * usually by clicking the X, or the cancel button
   * @param event
   * @param arg
   */
  onCloseModuleDialogCb(event, arg) {
    WindowManagerHelper.closeLoadModuleConfigWindow();
  }

};
