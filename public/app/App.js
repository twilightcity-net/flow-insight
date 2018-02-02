const { app, dialog } = require("electron"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  platform = require("electron-platform"),
  cleanStack = require("clean-stack"),
  Logger = require("./AppLogger"),
  AppError = require("./AppError"),
  Util = require("../Util"),
  WindowManager = require("../managers/WindowManager"),
  { EventManager } = require("../managers/EventManager"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  SlackManager = require("../managers/SlackManager"),
  AppUpdater = require("./AppUpdater"),
  AppSettings = require("./AppSettings"),
  AppActivator = require("./AppActivator"),
  AppLoader = require("./AppLoader");

//
// our main application class that is stored at global.App
//
module.exports = class App {
  constructor() {
    if (isDev) Util.setDevUserDataDir();
    this.Logger = Logger.create();
    this.events = {
      ready: this.onReady,
      singleInstance: this.onSingleInstance,
      windowAllClosed: this.onWindowAllClosed,
      quit: this.onQuit,
      crashed: this.onCrash
    };
    this.isSecondInstance = app.makeSingleInstance(this.onSingleInstance);
    if (this.isSecondInstance) {
      log.info("[App] quit -> second instance");
      this.quit();
    } else {
      this.start();
    }
  }

  /// called by the app ready event -> called first after electron app loaded
  onReady() {
    global.App.name = Util.getAppName();
    app.setName(global.App.name);
    log.info("[App] ready -> " + global.App.name);
    try {
      global.App.EventManager = new EventManager();
      global.App.WindowManager = new WindowManager();
      global.App.ShortcutManager = new ShortcutManager();
      global.App.SlackManager = new SlackManager();
      global.App.AppUpdater = new AppUpdater();
      global.App.AppSettings = new AppSettings();
      global.App.AppActivator = new AppActivator();
      global.App.AppLoader = new AppLoader();
      global.App.load();
    } catch (error) {
      App.handleError(error, true);
    }
  }

  /*
   * This listener is activate when someone tries to run the app again. This is also where
   * we would listen for any CLI commands or arguments... Such as MetaOS task-new or 
   * MetaOS -quit
   */
  onSingleInstance(commandLine, workingDirectory) {
    log.warn(
      "[App] second instance detected -> " +
        workingDirectory +
        " => " +
        commandLine
    );
  }

  /*
	 * idle the app if all windows are closed
	 */
  onWindowAllClosed() {
    log.info("[App] app idle : no windows");
  }

  /*
	 * called when the application is quiting
	 */
  onQuit(event, exitCode) {
    log.info("[App] quitting -> exitCode : " + exitCode);
  }

  /*
	 * handles when the gpu crashes then quites if not already quit.
	 */
  // TODO implement https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
  onCrash(event, killed) {
    App.handleError(
      new AppError("WTF the GPU crashed : killed=" + killed),
      true
    );
  }

  /*
   * watch for errors on the application
   */
  errorWatcher() {
    process.on("uncaughtException", error => App.handleError);
    process.on("unhandledRejection", error => App.handleError);
  }

  /*
   * process any errors thrown by the application
   */
  static handleError(error, fatal) {
    console.log("TEST");
    if (!(error instanceof AppError)) {
      error.stack = cleanStack(error.stack);
    }
    if (global.App) {
      log.error(
        (fatal ? "[FATAL] " : "") +
          "[App] " +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
    } else {
      console.error(
        (fatal ? "[FATAL] " : "") +
          error.toString() +
          "\n\n" +
          error.stack +
          "\n"
      );
    }
    if (fatal) {
      dialog.showErrorBox("MetaOS", "[FATAL] " + error.toString());
      process.exit(1);
    } else {
      dialog.showErrorBox("MetaOS", error.toString());
    }
  }

  /*
	 * used to start the app listeners which are dispatched by the apps events
	 */
  start() {
    log.info("[App] starting...");
    this.errorWatcher();
    app.on("ready", this.events.ready);
    app.on("window-all-closed", this.events.windowAllClosed);
    app.on("quit", this.events.quit);
    app.on("gpu-process-crashed", this.events.crashed);
  }

  /// called to start loading the application from AppLoader class
  load() {
    log.info("[App] checking for settings...");
    global.App.AppSettings.setApiKey("123e4567-e89b-12d3-a456-426655440000");
    if (global.App.AppSettings.check()) {
      // global.App.AppActivator.checkActivation();

      global.App.ApiKey = global.App.AppSettings.getApiKey();
      global.App.AppLoader.load();
    } else {
      global.App.AppActivator.start();
    }
  }

  /*
	 * wrapper function to quit the application
	 */
  quit() {
    app.quit();
  }
};
