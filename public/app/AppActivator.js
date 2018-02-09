const { dialog } = require("electron"),
  log = require("electron-log"),
  App = require("./App"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  AccountActivationDto = require("../dto/AccountActivationDto");

//
// class that is used to activate the application
//
module.exports = class AppActivator {
  constructor() {
    log.info("[AppActivator] created -> okay");
    this.app = App;
    this.events = {
      dataStoreLoad: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOAD,
        this,
        (event, arg) => {
          console.log("DATASTORE_LOAD");
          console.log(arg);
          arg.timestamp = new Date().getTime();
          arg.data = {
            status: "VALID",
            message: "Your account has been successfully activated.",
            email: "kara@dreamscale.io",
            apiKey: "FASFD423fsfd32d2322d"
          };
          console.log("DATASTORE_LOAD_RESPONSE");
          console.log(arg);
          this.events.dataStoreLoaded.dispatch(arg);
        }
      ),
      dataStoreLoaded: EventFactory.createEvent(
        EventFactory.Types.DATASTORE_LOADED,
        this
      ),
      saveActivation: EventFactory.createEvent(
        EventFactory.Types.APPACTIVATOR_SAVE_ACTIVATION,
        this,
        (event, arg) => this.onActivatorSaveCb(event, arg)
      ),
      closeActivator: EventFactory.createEvent(
        EventFactory.Types.WINDOW_ACTIVATOR_CLOSE,
        this
      )
    };
  }

  onActivatorSaveCb(event, arg) {
    log.info("[AppActivator] saving api-key...");
    try {
      let accountActivationDto = new AccountActivationDto(arg);
      global.App.AppSettings.setApiKey(accountActivationDto.apiKey);
      let apiKey = global.App.AppSettings.getApiKey();
      if (accountActivationDto.apiKey !== apiKey) {
        throw new Error("Unable to save api-key");
      }
    } catch (err) {
      log.error("[AppActivator] Unable to save api-key");
      global.App.AppSettings.deleteSettings();
      this.events.closeActivator.dispatch();
      dialog.showErrorBox("Torchie", "[FATAL] Unable to save api-key");
      process.exit(1);
    }
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
