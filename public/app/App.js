const { app } = require("electron"),
  fs = require("fs"),
  path = require("path"),
  chalk = require("chalk"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  rootPath = require("electron-root-path").rootPath,
  platform = require("electron-platform"),
  argv = require("yargs").argv,
  Logger = require("./AppLogger"),
  AppError = require("./AppError"),
  Util = require("../Util"),
  TalkManager = require("../managers/TalkManager"),
  VolumeManager = require("../managers/VolumeManager"),
  TeamManager = require("../managers/TeamManager"),
  MemberManager = require("../managers/MemberManager"),
  JournalManager = require("../managers/JournalManager"),
  CircuitManager = require("../managers/CircuitManager"),
  TeamCircuitManager = require("../managers/TeamCircuitManager"),
  TalkToManager = require("../managers/TalkToManager"),
  WindowManager = require("../managers/WindowManager"),
  { EventManager } = require("../events/EventManager"),
  EventFactory = require("../events/EventFactory"),
  {
    ShortcutManager
  } = require("../managers/ShortcutManager"),
  AppUpdater = require("./AppUpdater"),
  AppSettings = require("./AppSettings"),
  DataStoreManager = require("../managers/DtoClientManager"),
  AppActivator = require("./AppActivator"),
  AppLoader = require("./AppLoader"),
  AppHeartbeat = require("./AppHeartbeat"),
  AppLogin = require("./AppLogin"),
  AppController = require("../controllers/AppController"),
  AppBanner = [
    "                                                                                               ",
    "      .*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.\n" +
      "      :    __________ ___ ___ ___ ____ ____     ____ _________ _____ _____ ___________    :\n" +
      "      :   |          |   |   |   |    |    |   |    |      ___|     |     |           |   :\n" +
      "      :   |_        _|           |    |    |___|    |     |_+-|           |_         _|   :\n" +
      "      :     |______| |___________|____|________|____|_________|_____|_____|_|_______|     :\n" +
      "      :  *                       |             |    |              |       |        |     :\n" +
      "      :           \\|/     x      |       ______|    |__          __|__            __|     :\n" +
      "      :     x    --*--           |_____________|____|  |________|     |__________|     x  :\n" +
      "      :           /|\\         *                       *                                   :\n" +
      "      :                               x     T W I L I G H T  C I T Y , I N C  © 2 0 2 1   :\n" +
      "      :.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.:" +
      "                                                                                               \n"
  ];

module.exports = class App {
  constructor() {
    AppBanner.forEach(v =>
      console.log(chalk.bold.greenBright(v))
    );
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
    this.processCLI();
    this.isSecondInstance = app.makeSingleInstance(
      this.onSingleInstance
    );
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
          log.error(
            "Please pass 'Twilight City' a command or argument."
          );
          process.exit(0);
        } else {
          this.start();
        }
      } else {
        this.start();
      }
    }
  }

  /**
   * called by the app ready event -> called first after electron app loaded
   */
  onReady() {
    global.App.api = Util.getAppApi();
    global.App.name = Util.getAppName();
    global.App.talkUrl = Util.getAppTalkUrl();
    global.App.render3D = Util.getRender3D();
    global.App.idleTime = 0;
    global.App.isOnline = false;
    global.App.isLoggedIn = false;
    app.setName(global.App.name);

    log.info(
      "[App] ready -> " +
        global.App.name +
        " : " +
        global.App.api
    );
    log.info("[App] ready -> talk : " + global.App.talkUrl);
    log.info(
      "[App] ready -> render3D : " + global.App.render3D
    );
    try {
      global.App.EventManager = new EventManager();
      global.App.AppSettings = new AppSettings();
      global.App.WindowManager = new WindowManager();
      global.App.VolumeManager = new VolumeManager();
      global.App.TalkManager = new TalkManager();
      global.App.JournalManager = new JournalManager();
      global.App.TeamManager = new TeamManager();
      global.App.MemberManager = new MemberManager();
      global.App.CircuitManager = new CircuitManager();
      global.App.TeamCircuitManager = new TeamCircuitManager();
      global.App.TalkToManager = new TalkToManager();
      global.App.ShortcutManager = new ShortcutManager();
      global.App.AppUpdater = new AppUpdater();
      global.App.DataStoreManager = new DataStoreManager();
      global.App.AppActivator = new AppActivator();
      global.App.AppLoader = new AppLoader();
      global.App.AppHeartbeat = new AppHeartbeat();
      global.App.createQuitListener();
      global.App.load();
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

  /**
   * This listener is activate when someone tries to run the app again. This is also where
   * we would listen for any CLI commands or arguments... Such as tc task-new or
   * tc -quit
   * @param commandLine
   * @param workingDirectory
   */
  onSingleInstance(commandLine, workingDirectory) {
    log.warn(
      "[App] second instance detected -> " +
        workingDirectory +
        " => " +
        commandLine
    );
  }

  /**
   * processes the system command line arguments.. nothing fance should go here
   * will need to build a more complex CLI processor when we have actual an
   * API that requires using args.
   * check for --activate argument which can only be 'new' for now.
   * this will remove the previous license key and prompt for a new key
   */
  processCLI() {
    if (argv.deactivate || argv.DEACTIVATE) {
      console.log("deactivate!!!");
      // AppController.init(this);
    }
  }

  /**
   * idle the app if all windows are closed
   */
  onWindowAllClosed() {
    log.info("[App] app idle : no windows");
  }

  /**
   * called before windows are closed and is going to quit.
   * @param event
   */
  onWillQuit(event) {
    log.info(
      "[App] before quit -> attempt to logout application"
    );

    if (global.App.isLoggedIn) {
      event.preventDefault();
      global.App.WindowManager.destroyAllWindows();
      global.App.TalkManager.disconnect();
      AppLogin.doLogout(store => {
        log.info(
          "[App] before quit -> logout complete : quit"
        );
        app.exit(0);
      });

      setTimeout(() => {
        log.info(
          "[App] before quit -> logout timemout : quit"
        );
        app.exit(0);
      }, 10000);
    }
  }

  /**
   * called when the application is quiting
   * @param event
   * @param exitCode
   */
  onQuit(event, exitCode) {
    log.info("[App] quitting -> exitCode : " + exitCode);
  }

  /**
   *  handles when the gpu crashes then quites if not already quit.
   * @param event
   * @param killed
   */
  //TODO implement https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
  onCrash(event, killed) {
    App.handleError(
      new AppError(
        "WTF the GPU crashed : killed=" + killed
      ),
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

  /**
   * used to start the app listeners which are dispatched by the apps events
   */
  start() {
    log.info("[App] starting...");
    // this.errorWatcher();
    AppController.configureEvents();
    app.on("ready", this.events.ready);
    app.on(
      "window-all-closed",
      this.events.windowAllClosed
    );
    app.on("quit", this.events.quit);
    app.on("will-quit", this.events.willQuit);
    app.on("gpu-process-crashed", this.events.crashed);
  }

  /**
   * called to start loading the application from AppLoader class
   */
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

  /**
   * restarts the application if not in dev mode; uses hard quit to
   * bypass any of the quit events.
   */
  restart() {
    if (!isDev) app.relaunch();
    app.exit(0);
  }

  /**
   * wrapper function to quit the application
   */
  quit() {
    app.quit();
  }

  /**
   * async way to quit the application from renderer
   */
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
