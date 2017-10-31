const { app, dialog } = require("electron"),
  log = require("electron-log"),
  platform = require("electron-platform"),
  Logger = require("./Logger"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  { EventManager } = require("./EventManager"),
  { ShortcutManager } = require("./ShortcutManager"),
  SlackManager = require("./SlackManager"),
  AppUpdater = require("./AppUpdater"),
  AppLoader = require("./AppLoader");

/*
 * our main application class that is stored at global.App
 */
module.exports = class App {
  constructor() {
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
      log.info("[App] quit second instance...");
      this.quit();
    } else {
      this.start();
    }
  }

  /*
	 * called by the app ready event -> called first after electron app loaded
	 */
  onReady() {
    global.App.name = Util.getAppName();
    app.setName(global.App.name);
    log.info("[App] ready -> " + global.App.name);
    try {
      // TODO convert these to constructors inside global.App
      WindowManager.init();
      EventManager.init();
      ShortcutManager.init();
      global.App.SlackManager = new SlackManager();
      global.App.AppUpdater = new AppUpdater();
      AppLoader.init();
    } catch (error) {
      global.App.handleError(error, true);
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
    log.info(
      "[App] quitting -> " + event.sender.name + " exitCode : " + exitCode
    );
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
   * process any errors thrown by the application
   */
  handleError(error, fatal) {
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
      console.error((fatal ? "[FATAL] " : "") + error.toString());
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
    process.on("uncaughtException", error => App.handleError);
    app.on("ready", this.events.ready);
    app.on("window-all-closed", this.events.windowAllClosed);
    app.on("quit", this.events.quit);
    app.on("gpu-process-crashed", this.events.crashed);
  }

  /*
	 * wrapper function to quit the application
	 */
  quit() {
    app.quit();
  }
};
