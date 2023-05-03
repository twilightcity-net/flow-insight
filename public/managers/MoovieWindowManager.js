const log = require("electron-log");
const EventFactory = require("../events/EventFactory");
const WindowManagerHelper = require("./WindowManagerHelper");
const shell = require('electron').shell;

/**
 * managing class for opening the popup moovie windows
 */
module.exports = class MoovieWindowManager {
  static NETFLIX_PREFIX = "https://www.netflix.com/";
  static AMAZON_PREFIX = "https://www.amazon.com/";
  static HBOMAX_PREFIX = "https://play.hbomax.com/";
  static DISNEY_PREFIX = "https://www.disneyplus.com/";
  static PRIME_PREFIX = "https://www.primevideo.com/";
  static AMAZON_CA_PREFIX = "https://www.amazon.ca/";
  static PROJECTFREE_PREFIX = "https://projectfreetv.one/";
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
      WindowManagerHelper.createMoovieWindow({moovieId: arg.moovie.id});
    } else {
      throw Error("Unexpected link should be a movie site link");
    }
  }

  /**
   * When we exit the theater we want to close the moovie window
   */
  onCloseMoovieCb(event, arg) {
    console.log("Closing moovie!");
    WindowManagerHelper.closeMoovieWindow();

    global.App.MessageWindowManager.unhideDockIfNoMessageWindowsOpen();
  }

  isValidUrl(url) {
    return url.startsWith(MoovieWindowManager.AMAZON_PREFIX)
      || url.startsWith(MoovieWindowManager.NETFLIX_PREFIX)
      || url.startsWith(MoovieWindowManager.HBOMAX_PREFIX)
      || url.startsWith(MoovieWindowManager.AMAZON_CA_PREFIX)
      || url.startsWith(MoovieWindowManager.PRIME_PREFIX)
      || url.startsWith(MoovieWindowManager.PROJECTFREE_PREFIX)
      || url.startsWith(MoovieWindowManager.DISNEY_PREFIX);
  }

  closeMoovieWindow() {
    WindowManagerHelper.closeMoovieWindow();
  }

  isMoovieWindowOpen() {
    return WindowManagerHelper.isMoovieWindowOpen();
  }

};
