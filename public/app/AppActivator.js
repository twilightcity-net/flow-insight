const log = require("electron-log"),
  App = require("./App"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");
// EventFactory = require("../managers/EventFactory");

//
// class that is used to activate the application
//
module.exports = class AppActivator {
  constructor() {
    log.info("[AppActivator] created -> okay");
    this.app = App;
    // this.events = {
    //   closeActivator: EventFactory.createEvent(
    //     EventFactory.Types.WINDOW_ACTIVATOR_CLOSE,
    //     this,
    //     (event, arg) => this.onActivatorCloseCb(event, arg)
    //   )
    // };
  }

  checkActivation() {
    log.info("[AppActivator] checking activation...");
    let apiKey = global.App.AppSettings.getApiKey();
    log.info("[AppActivator] verifying key -> " + apiKey);
    if (apiKey === "") {
      this.start();
    } else {
      // perform REST check on key
      // this.events.activated.dispatch("1");
    }
  }

  /// starts the app loader
  start() {
    log.info("[AppActivator] show activator");
    this.activatorWindow = WindowManagerHelper.createWindowActivator();
  }

  /*
   * called when AppLoader is completed
   */
  finished() {
    log.info("[AppActivator] finished : okay");
    global.App.WindowManager.closeWindow(this.activatorWindow, true);
  }
};
