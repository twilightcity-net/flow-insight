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
  VolumeManager = require("../database/VolumeManager"),
  CircuitManager = require("../managers/CircuitManager"),
  WindowManager = require("../managers/WindowManager"),
  { EventManager } = require("../events/EventManager"),
  EventFactory = require("../events/EventFactory"),
  { ShortcutManager } = require("../managers/ShortcutManager"),
  SlackManager = require("../managers/SlackManager"),
  AppUpdater = require("./AppUpdater"),
  AppSettings = require("./AppSettings"),
  DataStoreManager = require("../managers/DtoClientManager"),
  AppActivator = require("./AppActivator"),
  AppLoader = require("./AppLoader"),
  AppHeartbeat = require("./AppHeartbeat"),
  AppLogin = require("./AppLogin"),
  AppController = require("../controllers/AppController"),
  AppBanner = [
    "                                                                          ",
    "     .:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.      ",
    "     :   ________ _____ ______ _______ _______ _______ _____       :      ",
    "     :  ||      |     |   __ \\\\      |   |   |_     _|  ___|       :      ",
    "     :  ||_    _|  -  |      <_   ---|       |_|   |_|  ___|       :      ",
    "     :   __|__|_|_____|___|____|_____|___|___|_______|_____|       :      ",
    "     :  |     ____|    |    |      ___|   |____|   |_______        :      ",
    "     :  |___      |         |      ___|        |           |_____  :      ",
    "     :  |_________|____|____|_________|________|_ZoeDreams_|800XL| :      ",
    "     :                              D R E A M S C A L E © 2 0 2 0  :      ",
    "     :                                                             :      ",
    "     :.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:.:      ",
    "                                                                          \n"
  ];

/**
 *                              P R E S E N T S :
 *
 *                     A N ARTY & ZOE P R O D U C T I O N :
 *
 *            S U P P L I E D BY : P D X // O X Y // A T R // 1337
 *
 *              > > > A MESSAGE F R O M OUR S P O N S O R S < < <
 *            support local! throw out your phone and buy a console!
 *
 *
 * D R E A M S C A L E © 2 0 2 0 /// D R E A M S C A L E © 2 0 2 0 /// D R E A M S C A L E © 2 0 2 0 /// /// /// /// ///
 *
 * TORCHIE-SHELL IS A RESTRICTED OPERATING SYSTEM UNDER BSD LICENSE. ACCESS beyond this point.
 * Authorized PERSONNEL, AGENTS and SYSTEMS ONLY.
 *
 * WARNING BY access this system you agree that:
 *
 * You are accessing a DreamScale Information System (IS) that is provided for authorized use only.
 * By using this IS (which includes any device attached to this IS), you consent to the following conditions:
 *
 * + The SYSTEM routinely intercepts and monitors communications on this IS for purposes including, but not limited to,
 *   penetration testing, COMSEC monitoring, network operations and defense, personnel misconduct (PM), any engagement
 *   with law enforcement (LE), and counterintelligence (CI) investigations of foreign or domestic.
 *
 * + The NETWORK exists soley for educational and scientific research purposes. ANY access related to MILITARY use
 *   could be considered a THREAT, which may result in bad things. Don't Do IT.
 *
 * + At any time, the SYSTEM may inspect and seize data stored on this IS; see above item (2)
 *
 * + Communications using, or data stored on, this IS PRIVATE, HOWEVER there is also PUBLIC data that could be subject
 *   to routine monitoring, interception, and search by the IS
 *
 * + This IS includes security measures (e.g., authentication and access controls) to protect PRIVATE security and data
 *
 * + Notwithstanding the above, using this IS does not constitute consent to PM, LE or CI investigative searching
 *   or monitoring of the content of privileged communications, or work product, related to personal representation
 *   or services by attorneys, psychotherapists, or clergy, and their assistants. Such communications and work
 *   product are private and confidential. See User Agreement for details.
 *
 *   /\/ Mess With The Best ..........................Die Like The Rest ! /\/
 *
 * D R E A M S C A L E © 2 0 2 0 /// D R E A M S C A L E © 2 0 2 0 /// D R E A M S C A L E © 2 0 2 0 /// /// /// /// ///
 *
 * @type {App}
 */
module.exports = class App {
  constructor() {
    AppBanner.forEach(v => console.log(chalk.bgHex("6435C9").bold.white(v)));
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
    global.App.api = Util.getAppApi();
    global.App.name = Util.getAppName();
    global.App.talkUrl = Util.getAppTalkUrl();
    global.App.render3D = Util.getRender3D();
    global.App.idleTime = 0;
    global.App.isOnline = false;
    global.App.isLoggedIn = false;
    app.setName(global.App.name);

    log.info("[App] ready -> " + global.App.name + " : " + global.App.api);
    log.info("[App] ready -> talk : " + global.App.talkUrl);
    log.info("[App] ready -> render3D : " + global.App.render3D);
    try {
      global.App.EventManager = new EventManager();
      global.App.AppSettings = new AppSettings();
      global.App.WindowManager = new WindowManager();
      global.App.TalkManager = new TalkManager();
      global.App.CircuitManager = new CircuitManager();
      global.App.ShortcutManager = new ShortcutManager();
      global.App.SlackManager = new SlackManager();
      global.App.AppUpdater = new AppUpdater();
      global.App.VolumeManager = new VolumeManager();
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
      // AppController.init(this);
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
    if (global.App.isLoggedIn) {
      event.preventDefault();
      global.App.WindowManager.destroyAllWindows();
      global.App.TalkManager.disconnect();
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
