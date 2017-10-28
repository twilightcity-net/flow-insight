const { app } = require("electron"),
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

    // only allow one instance of the application
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

    // let promise = new Promise((resolve, reject) => resolve())
    //     .then(() => ShortcutManager.createGlobalShortcuts())
    //     .then(() => this.events.shortcutsCreated.dispatch())
    //     .catch(error => this.handleError(error));

    WindowManager.init();
    EventManager.init();
    ShortcutManager.init();
    SlackManager.init();
    AppUpdater.init();
    AppLoader.init();
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

    // TODO process any command line arguments here
  }

  /*
	 * idle the app if all windows are closed
	 */
  onWindowAllClosed() {
    log.info("[App] app idle : no windows");

    // TODO make sure we have the app data saved
  }

  /*
	 * called when the application is quiting
	 */
  onQuit(event, exitCode) {
    log.info(
      "[App] quitting -> " + event.sender.name + " exitCode : " + exitCode
    );

    // TODO make sure we save the user data and app data, show closing window?
  }

  /*
	 * handles when the gpu crashes then quites if not already quit.
	 */
  onCrash(event, killed) {
    log.error("[App] WTF : gpu crashed and burned -> killed : " + killed);
    log.error(event);
    app.quit();

    // TODO implement https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
  }

  /*
	 * used to start the app listeners which are dispatched by the apps events
	 */
  start() {
    log.info("[App] starting...");
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
