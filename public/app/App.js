const { app, dialog, Menu } = require("electron"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  platform = require("electron-platform"),
  cleanStack = require("clean-stack"),
  Logger = require("./AppLogger"),
  AppError = require("./AppError"),
  Util = require("../Util"),
    RTFlowManager = require("../managers/RTFlowManager"),
  WindowManager = require("../managers/WindowManager"),
  { EventManager } = require("../managers/EventManager"),
  EventFactory = require("../managers/EventFactory"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  SlackManager = require("../managers/SlackManager"),
  AppUpdater = require("./AppUpdater"),
  AppSettings = require("./AppSettings"),
  DataStoreManager = require("../managers/DataStoreManager"),
  AppActivator = require("./AppActivator"),
  AppLoader = require("./AppLoader"),
  AppHeartbeat = require("./AppHeartbeat"),
  AppLogin = require("./AppLogin");

module.exports = class App {
  constructor() {
    if (isDev) Util.setDevUserDataDir();
    this.Logger = Logger.create();
    this.events = {
      ready: this.onReady,
      singleInstance: this.onSingleInstance,
      windowAllClosed: this.onWindowAllClosed,
      quit: this.onQuit,
      willQuit: this.onWillQuit,
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
    global.App.api = Util.getAppApi();
    global.App.name = Util.getAppName();
    global.App.rtFlowUrl = "https://ds-rt-flow.herokuapp.com";
    global.App.idleTime = 0;
    global.App.isOnline = false;
    global.App.isLoggedIn = false;
    app.setName(global.App.name);
    log.info("[App] ready -> " + global.App.name + " : " + global.App.api);
    try {
      global.App.EventManager = new EventManager();
      global.App.WindowManager = new WindowManager();
      global.App.RTFlowManager = new RTFlowManager();
      global.App.ShortcutManager = new ShortcutManager();
      global.App.SlackManager = new SlackManager();
      global.App.AppUpdater = new AppUpdater();
      global.App.AppSettings = new AppSettings();
      global.App.DataStoreManager = new DataStoreManager();
      global.App.AppActivator = new AppActivator();
      global.App.AppLoader = new AppLoader();
      global.App.AppHeartbeat = new AppHeartbeat();
      global.App.createQuitListener();
      global.App.load();
    } catch (error) {
      App.handleError(error, true);
    }
  }

  /// This listener is activate when someone tries to run the app again. This is also where
  /// we would listen for any CLI commands or arguments... Such as Torchie task-new or
  /// Torchie -quit
  onSingleInstance(commandLine, workingDirectory) {
    log.warn(
      "[App] second instance detected -> " +
        workingDirectory +
        " => " +
        commandLine
    );
  }

  /// idle the app if all windows are closed
  onWindowAllClosed() {
    log.info("[App] app idle : no windows");
  }

  /// called before windows are closed and is going to quit.
  onWillQuit(event) {
    log.info("[App] before quit -> attempt to logout application");

    /// only logout if we are already logged in. This is used to
    /// bypass quiting during activation or loading
    if (global.App.isLoggedIn) {
      event.preventDefault();
      AppLogin.doLogout(store => {
        log.info("[App] before quit -> logout complete : quit");
        app.exit(0);
      });

      /// hard quit just to make sure we dont memory leak
      setTimeout(() => {
        log.info("[App] before quit -> logout timemout : quit");
        app.exit(0);
      }, 10000);
    }
  }

  /// called when the application is quiting
  onQuit(event, exitCode) {
    log.info("[App] quitting -> exitCode : " + exitCode);
  }

  /// handles when the gpu crashes then quites if not already quit.
  // TODO implement https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
  onCrash(event, killed) {
    App.handleError(
      new AppError("WTF the GPU crashed : killed=" + killed),
      true
    );
  }

  /// watch for errors on the application
  errorWatcher() {
    process.on("uncaughtException", error => App.handleError);
    process.on("unhandledRejection", error => App.handleError);
  }

  /// process any errors thrown by the application
  static handleError(error, fatal) {
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
      dialog.showErrorBox("Torchie", "[FATAL] " + error.toString());
      process.exit(1);
    } else {
      dialog.showErrorBox("Torchie", error.toString());
    }
  }

  /// used to start the app listeners which are dispatched by the apps events
  start() {
    log.info("[App] starting...");
    this.errorWatcher();
    app.on("ready", this.events.ready);
    app.on("window-all-closed", this.events.windowAllClosed);
    app.on("quit", this.events.quit);
    app.on("will-quit", this.events.willQuit);
    app.on("gpu-process-crashed", this.events.crashed);
  }

  /// called to start loading the application from AppLoader class
  load() {
    log.info("[App] checking for settings...");
    if (global.App.AppSettings.check()) {
      global.App.ApiKey = global.App.AppSettings.getApiKey();
      global.App.AppLoader.load();
    } else {
      global.App.AppActivator.start();
      global.App.AppLoader.createMenu();
    }
  }

  /// restarts the application if not in dev mode; uses hard quit to
  /// bypass any of the quit events.
  restart() {
    if (!isDev) app.relaunch();
    app.exit(0);
  }

  /// wrapper function to quit the application
  quit() {
    app.quit();
  }

  /// async way to quit the application from renderer
  createQuitListener() {
    this.events.quitListener = EventFactory.createEvent(
      EventFactory.Types.APP_QUIT,
      this,
      (event, arg) => {
        global.App.quit();
      }
    );
  }
};
