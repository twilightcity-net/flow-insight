const log = require("electron-log"),
  EventFactory = require("../managers/EventFactory"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

//
// class that is used to activate the application
//
module.exports = class AppActivator {
  constructor() {
    log.info("[AppActivator] created -> okay");
    this.events = {
      activated: EventFactory.createEvent(
        EventFactory.Types.APPACTIVATOR_ACTIVATED,
        this,
        (event, arg) => this.onActivatedCb()
      )
    };
  }

  onActivatedCb(event, arg) {
    console.log("onActivatedCb");
    // global.App.events.appActivated();
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
