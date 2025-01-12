const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const {ShortcutManager} = require("./ShortcutManager");
const AppFeatureToggle = require("../app/AppFeatureToggle");

const is_mac = process.platform==='darwin';

/**
 * managing class for the popup fervie window
 */
module.exports = class FervieWindowManager {
  static windowNamePrefix = "tc-fervie-";

  /**
   * builds the FervieWindowManager for the global app scope
   */
  constructor() {
    this.name = "[FervieWindowManager]";

    this.shortcutReceivedEvent = EventFactory.createEvent(
      EventFactory.Types.SHORTCUTS_RECIEVED,
      this,
      (event, arg) => this.onShortcutReceivedCb(event, arg)
    );

    this.fervieToggleEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_FERVIE_SHOW_HIDE,
      this
    );

  }

  onShortcutReceivedCb(event, arg) {
    if (ShortcutManager.Names.GLOBAL_SHOW_HIDE_FERVIE === arg
      && AppFeatureToggle.isFerviePopupEnabled()) {
      this.handleToggleFervieShowHide();
    }
  }

  handleToggleFervieShowHide() {
    console.log("toggle fervie show hide!");
    this.fervieToggleEvent.dispatch({request: "hotkey"});
  }


};
