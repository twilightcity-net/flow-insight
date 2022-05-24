const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");
const shell = require('electron').shell;

/**
 * managing class for opening the popup moovie windows
 */
module.exports = class MoovieWindowManager {
  static WINDOW_NAME = "tc-moovie-chat";

  static NETFLIX_PREFIX = "https://www.netflix.com/";
  static AMAZON_PREFIX = "https://www.amazon.com/";
  static HBOMAX_PREFIX = "https://play.hbomax.com/";

  /**
   * builds the ChartWindowManager for the global app scope
   */
  constructor() {
    this.name = "[MoovieWindowManager]";

    this.openMoovieWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_OPEN_MOOVIE,
      this,
      (event, arg) => this.onOpenMoovieCb(event, arg)
    );

    this.closeMoovieWindowEvent = EventFactory.createEvent(
      EventFactory.Types.WINDOW_CLOSE_MOOVIE,
      this,
      (event, arg) => this.onCloseMoovieCb(event, arg)
    );
  }

  /**
   * When an open moovie window is triggered, opens the movie link provided in the description
   * (to Amazon, Netflix, HBO etc in an isolated safe window context detached from our node process)
   * The chat window will be a second window launched on top of the external window
   * @param event
   * @param arg
   */
  onOpenMoovieCb(event, arg) {

    console.log("Launching "+arg.moovie.link);

    if (this.isValidUrl(arg.moovie.link)) {
      shell.openExternal(arg.moovie.link);
      WindowManagerHelper.createMoovieWindow(MoovieWindowManager.WINDOW_NAME, arg.moovie);
    } else {
      throw Error("Unexpected link should be a movie site link");
    }
  }

  /**
   * When we exit the theater we want to close the moovie window
   */
  onCloseMoovieCb(event, arg) {

    console.log("Closing moovie!");
    WindowManagerHelper.closeWindow(MoovieWindowManager.WINDOW_NAME);
  }

  isValidUrl(url) {
    return url.startsWith(MoovieWindowManager.AMAZON_PREFIX)
      || url.startsWith(MoovieWindowManager.NETFLIX_PREFIX)
      || url.startsWith(MoovieWindowManager.HBOMAX_PREFIX);
  }

  closeMoovieWindow() {
    //WindowManagerHelper.closeWindow(MoovieWindowManager.windowName);
  }

};
