let { dialog } = require("electron"),
  log = require("electron-log"),
  App = require("./App"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper"),
  EventFactory = require("../managers/EventFactory"),
  AccountActivationDto = require("../dto/AccountActivationDto");

/**
 * class that is used to activate the application
 * @class AppActivator
 * @type {module.App}
 */
module.exports = class AppActivator {
  constructor() {
    log.info("[AppActivator] created okay");
    this.app = App;
    this.events = {
      saveActivation: EventFactory.createEvent(
        EventFactory.Types.APPACTIVATOR_SAVE_ACTIVATION,
        this,
        (event, arg) => this.onActivatorSaveCb(event, arg)
      ),
      activationSaved: EventFactory.createEvent(
        EventFactory.Types.APPACTIVATOR_ACTIVATION_SAVED,
        this
      ),
      closeActivator: EventFactory.createEvent(
        EventFactory.Types.WINDOW_ACTIVATOR_CLOSE,
        this
      )
    };
  }

  /**
   * callback function that is called when the activator fires the save event
   * @param event
   * @param arg
   */
  onActivatorSaveCb(event, arg) {
    log.info("[AppActivator] saving api-key...");
    try {
      let accountActivationDto = new AccountActivationDto(arg);
      global.App.AppSettings.save(
        Util.getAppApi(),
        accountActivationDto.apiKey
      );

      log.info("[AppActivator] verify api key...");
      let apiKey = global.App.AppSettings.getApiKey();
      if (accountActivationDto.apiKey !== apiKey) {
        throw new Error("Unable to save api-key");
      }
      this.events.activationSaved.dispatch();
    } catch (err) {
      log.error("[AppActivator] Unable to save api-key : " + err);
      this.events.closeActivator.dispatch(-1);
      dialog.showErrorBox("Torchie", "[FATAL] Unable to save api-key");
      process.exit(1);
    }
  }

  /**
   * starts the app loader
   */
  start() {
    log.info("[AppActivator] show activator");
    this.activatorWindow = WindowManagerHelper.createWindowActivator();
  }

  /**
   * called when AppLoader is completed
   */
  finished() {
    log.info("[AppActivator] finished : okay");
    global.App.WindowManager.closeWindow(this.activatorWindow, true);
  }
};
