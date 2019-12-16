const GLOBAL_ = global,
  { app } = require("electron"),
  fs = require("fs"),
  path = require("path"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  rootPath = require("electron-root-path").rootPath,
  platform = require("electron-platform"),
  argv = require("yargs").argv,
  Logger = require("./AppLogger"),
  AppError = require("./AppError"),
  Util = require("../Util"),
  TalkManager = require("../managers/TalkManager"),
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
  AppLogin = require("./AppLogin"),
  AppController = require("../controllers/AppController");

module.exports = class App {
  constructor() {
    if (isDev) Util.setDevUserDataDir();
    this.Logger = Logger.create();
    this.myController = new AppController(app);
    this.events = {
      ready: this.onReady,
      singleInstance: this.onSingleInstance,
      windowAllClosed: this.onWindowAllClosed,
      quit: this.onQuit,
      willQuit: this.onWillQuit,
      crashed: this.onCrash
    };
    this.setupCLI();
    this.processCLI();
    this.isSecondInstance = app.makeSingleInstance(this.onSingleInstance);
    if (this.isSecondInstance) {
      log.info("[App] quit -> second instance");

      //TODO need to implement a check for args

      //TODO need to implement a CLIManager that works with yarv

      this.quit();
    } else {
      if (isDev) {
        this.start();
      } else if (Util.checkIfCalledFromCLI(process.argv)) {
        if (rootPath.startsWith("/Applications")) {
          log.error("Please pass 'Torchie' a command or argument.");
          process.exit(0);
        } else {
          this.start();
        }
      } else {
        this.start();
      }
    }
  }

  /// called by the app ready event -> called first after electron app loaded
  onReady() {
    GLOBAL_.App.api = Util.getAppApi();
    GLOBAL_.App.name = Util.getAppName();
    GLOBAL_.App.talkUrl = Util.getAppTalkUrl();
    GLOBAL_.App.render3D = Util.getRender3D();
    GLOBAL_.App.idleTime = 0;
    GLOBAL_.App.isOnline = false;
    GLOBAL_.App.isLoggedIn = false;
    app.setName(GLOBAL_.App.name);

    log.info("[App] ready -> " + GLOBAL_.App.name + " : " + GLOBAL_.App.api);
    log.info("[App] ready -> talk : " + GLOBAL_.App.talkUrl);
    log.info("[App] ready -> render3D : " + GLOBAL_.App.render3D);
    try {
      GLOBAL_.App.EventManager = new EventManager();
      GLOBAL_.App.WindowManager = new WindowManager();
      GLOBAL_.App.TalkManager = new TalkManager();
      GLOBAL_.App.ShortcutManager = new ShortcutManager();
      GLOBAL_.App.SlackManager = new SlackManager();
      GLOBAL_.App.AppUpdater = new AppUpdater();
      GLOBAL_.App.AppSettings = new AppSettings();
      GLOBAL_.App.DataStoreManager = new DataStoreManager();
      GLOBAL_.App.AppActivator = new AppActivator();
      GLOBAL_.App.AppLoader = new AppLoader();
      GLOBAL_.App.AppHeartbeat = new AppHeartbeat();
      GLOBAL_.App.createQuitListener();
      GLOBAL_.App.load();
    } catch (error) {
      App.handleError(error, true);
    } finally {
      if (isDev) {
        const {
          default: installExtension,
          REACT_DEVELOPER_TOOLS
        } = require("electron-devtools-installer");
        installExtension(REACT_DEVELOPER_TOOLS)
          .then(name => {
            log.info("[App] ready -> dev tools : " + name);
          })
          .catch(err => {
            AppError.handleError(err, false);
          });
      }
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

  /// processes the system command line arguments.. nothing fance should go here
  /// will need to build a more complex CLI processor when we have actual an
  /// API that requires using args
  processCLI() {
    /// check for --activate argument which can only be 'new' for now.
    /// this will remove the previous license key and prompt for a new key
    if (argv.deactivate || argv.DEACTIVATE) {
      console.log("deactivate!!!");
      AppController.init(this);
    }
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
    if (GLOBAL_.App.isLoggedIn) {
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

  /**
   * proxy method for AppError class handler
   * @param error - the error that was thrown
   * @param fatal - shut down the app or not
   * @deprecated - should use AppError.handleError(err,fatal)
   */
  static handleError(error, fatal) {
    AppError.handleError(error, fatal);
  }

  /// sets up the command line interface so that we can call functions\
  setupCLI() {
    log.info("[App] setting up CLI -> " + rootPath);
    if (platform.isDarwin) {
      log.info("[App] detecting OS -> Mac...");
      let bashProfile = ".bash_profile",
        homePath = Util.getUserHomePath(),
        filePath = path.join(homePath, bashProfile),
        appPath = !rootPath.startsWith("/Applications")
          ? !rootPath.endsWith("Torchie.app")
            ? "/dist/mac/Torchie.app/Contents/MacOS"
            : "/Contents/MacOS"
          : "/Contents/MacOS",
        torchiePath = path.join(rootPath, appPath),
        cliPath = "\r\n### torchie-cli ###\r\nexport PATH=$PATH:" + torchiePath,
        fileData = fs.readFileSync(filePath, "utf8");
      if (!fileData.includes(cliPath)) {
        log.info("[App] append .bash_profile -> " + torchiePath);
        fs.appendFileSync(filePath, cliPath);
      }
    } else if (platform.isWin32) {
      log.info("[App] detecting OS -> Windows...");
    } else {
      log.info("[App] detecting OS -> Linux...");
    }
  }

  /// used to start the app listeners which are dispatched by the apps events
  start() {
    log.info("[App] starting...");
    // this.errorWatcher();
    AppController.configureEvents();

    app.on("ready", this.events.ready);
    app.on("window-all-closed", this.events.windowAllClosed);
    app.on("quit", this.events.quit);
    app.on("will-quit", this.events.willQuit);
    app.on("gpu-process-crashed", this.events.crashed);
  }

  /// called to start loading the application from AppLoader class
  load() {
    log.info("[App] checking for settings...");
    if (GLOBAL_.App.AppSettings.check()) {
      GLOBAL_.App.ApiKey = GLOBAL_.App.AppSettings.getApiKey();
      GLOBAL_.App.AppLoader.load();
    } else {
      GLOBAL_.App.AppActivator.start();
      GLOBAL_.App.AppLoader.createMenu();
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
        GLOBAL_.App.quit();
      }
    );
  }
};
