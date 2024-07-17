const {app, session} = require("electron"),
  chalk = require("chalk"),
  log = require("electron-log"),
  isDev = require("electron-is-dev"),
  rootPath = require("electron-root-path").rootPath,
  argv = require("yargs").argv,
  Logger = require("./AppLogger"),
  AppError = require("./AppError"),
  Util = require("../Util"),
  TalkManager = require("../managers/TalkManager"),
  VolumeManager = require("../managers/VolumeManager"),
  TeamManager = require("../managers/TeamManager"),
  DictionaryManager = require("../managers/DictionaryManager"),
  MemberManager = require("../managers/MemberManager"),
  JournalManager = require("../managers/JournalManager"),
  CircuitManager = require("../managers/CircuitManager"),
  TeamCircuitManager = require("../managers/TeamCircuitManager"),
  TalkToManager = require("../managers/TalkToManager"),
  WindowManager = require("../managers/WindowManager"),
  FervieManager = require("../managers/FervieManager"),
  CodeManager = require("../managers/CodeManager"),
  FervieActionManager = require("../managers/FervieActionManager"),
  TerminalManager = require("../managers/TerminalManager"),
  ChartManager = require("../managers/ChartManager"),
  ChartWindowManager = require("../managers/ChartWindowManager"),
  NotificationManager = require("../managers/NotificationManager"),
  {EventManager} = require("../events/EventManager"),
  EventFactory = require("../events/EventFactory"),
  {
    ShortcutManager,
  } = require("../managers/ShortcutManager"),
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
    "      :    ____________ _______       _______________ ____        ____          /         :\n" +
    "      :   |       _____|       |     |               |    |  __  |    |      /\\/          :\n" +
    "      :   |       __|  |       |_____|       |       |     \\/  \\/     |     /             :\n" +
    "      :   |______|_____|_____________|_______________|________________|_________________  :\n" +
    "      :          |     |        |    |   _______|    |      ___|      |     |           | :\n" +
    "      :          |     |     |       |_______   |    |     |_+-|            |_         _| :\n" +
    "      :       /  |_____|_____|_______|__________|____|_________|______|_____| |_______|   :\n" +
    "      :    /\\/                                                                            :\n" +
    "      :   /                              T W I L I G H T  C I T Y , I N C  © 2 0 2 1      :\n" +
    "      :.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.:" +
    "                                                                                               \n",
  ];

const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS,
} = require("electron-devtools-installer");
const ConfigWindowManager = require("../managers/ConfigWindowManager");
const HotkeyManager = require("../managers/HotkeyManager");
const MoovieManager = require("../managers/MoovieManager");
const FlowManager = require("../managers/FlowManager");
const MoovieWindowManager = require("../managers/MoovieWindowManager");
const CircuitMemberManager = require("../managers/CircuitMemberManager");
const MessageWindowManager = require("../managers/MessageWindowManager");
const FervieWindowManager = require("../managers/FervieWindowManager");
const AccountManager = require("../managers/AccountManager");
const FeatureToggleManager = require("../managers/FeatureManager");

const PluginRegistrationHandler = require("../job/PluginRegistrationHandler");
const CodeModuleConfigHandler = require("../job/CodeModuleConfigHandler");
const FervieActionConfigHandler = require("../job/FervieActionConfigHandler");
const FervieActionRunner =  require("../job/FervieActionRunner");
const FlowStateTracker =  require("../job/FlowStateTracker");
const AppFlowPublisherJob = require("./AppFlowPublisherJob");
const AppFervieHelpJob = require("./AppFervieHelpJob");
const is_mac = process.platform==='darwin';

module.exports = class App {
  constructor() {
    AppBanner.forEach((v) =>
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
      crashed: this.onCrash,
    };
    this.processCLI();

    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
      log.info(
        "Couldn't acquire app lock, instance already running.  Quitting..."
      );
      app.quit();
    } else {
      app.on(
        "second-instance",
        (event, commandLine, workingDirectory) => {
          // Someone tried to run a second instance, we should focus our window.
        }
      );

      //SECURITY PATCH to prevent exploit, fixed in 13.6.6+
      app.on(
        "web-contents-created",
        (event, webContents) => {
          webContents.on(
            "select-bluetooth-device",
            (event, devices, callback) => {
              // Prevent default behavior
              event.preventDefault();
              // Cancel the request
              callback("");
            }
          );
        }
      );

      //SECURITY PATCH to prevent exploit
      delete require("electron").nativeImage
        .createThumbnailFromPath;

      //load the rest of the app
      if (isDev) {
        this.start();
      } else if (Util.checkIfCalledFromCLI(process.argv)) {
        if (rootPath.startsWith("/Applications")) {
          log.error(
            "Please pass 'FlowInsight' a command or argument."
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
      global.App.FeatureToggleManager = new FeatureToggleManager();
      global.App.WindowManager = new WindowManager();
      global.App.VolumeManager = new VolumeManager();
      global.App.TalkManager = new TalkManager();
      global.App.JournalManager = new JournalManager();
      global.App.TeamManager = new TeamManager();
      global.App.DictionaryManager = new DictionaryManager();
      global.App.MemberManager = new MemberManager();
      global.App.CircuitManager = new CircuitManager();
      global.App.TeamCircuitManager = new TeamCircuitManager();
      global.App.TalkToManager = new TalkToManager();
      global.App.ShortcutManager = new ShortcutManager();
      global.App.FervieManager = new FervieManager();
      global.App.CodeManager = new CodeManager();
      global.App.CodeModuleConfigHandler = new CodeModuleConfigHandler();
      global.App.FervieActionConfigHandler = new FervieActionConfigHandler();
      global.App.PluginRegistrationHandler = new PluginRegistrationHandler();
      global.App.FervieActionManager = new FervieActionManager();
      global.App.FervieActionRunner = new FervieActionRunner();
      global.App.FlowStateTracker = new FlowStateTracker();
      global.App.AccountManager = new AccountManager();
      global.App.MoovieManager = new MoovieManager();
      global.App.FlowManager = new FlowManager();
      global.App.CircuitMemberManager = new CircuitMemberManager();
      global.App.NotificationManager = new NotificationManager();
      global.App.TerminalManager = new TerminalManager();
      global.App.ChartManager = new ChartManager();
      global.App.HotkeyManager = new HotkeyManager();
      global.App.ChartWindowManager = new ChartWindowManager();
      global.App.MessageWindowManager = new MessageWindowManager();
      global.App.FervieWindowManager = new FervieWindowManager();
      global.App.MoovieWindowManager = new MoovieWindowManager();
      global.App.ConfigWindowManager = new ConfigWindowManager();
      global.App.DataStoreManager = new DataStoreManager();
      global.App.AppFlowPublisherJob = new AppFlowPublisherJob();
      global.App.AppFervieHelpJob = new AppFervieHelpJob();
      global.App.AppActivator = new AppActivator();
      global.App.AppLoader = new AppLoader();
      global.App.AppHeartbeat = new AppHeartbeat();
      global.App.createQuitListener();
      global.App.load();
      global.App.hide = () => {
        if (is_mac) {
          app.hide();
        }
      }
      global.App.show = () => {
        if (is_mac) {
          app.show();
        }
      }
    } catch (error) {
      App.handleError(error, true);
    } finally {
      if (!isDev) {
        //in prod mode, this disallows opening the dev tools
        app.whenReady().then(() => {
          session.defaultSession.webRequest.onHeadersReceived(
            (details, callback) => {
              callback({
                responseHeaders: {
                  ...details.responseHeaders,
                  "Content-Security-Policy": [
                    "script-src 'self'",
                  ],
                },
              });
            }
          );
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
  onWindowAllClosed(event) {
    log.info("[App] app windows all closed");
    global.App.onWillQuit(event);
  }

  /**
   * called before windows are closed and is going to quit.
   * @param event
   */
  onWillQuit(event) {
    event.preventDefault();

    try {
      log.info(
        "[App] before quit -> attempt to logout application"
      );

      global.App.TalkManager.disconnect();

      if (global.App.isLoggedIn) {
        log.info("[App] logout starting");

        AppLogin.doLogout((store) => {
          log.info(
            "[App] before quit -> logout complete : quit"
          );
          app.exit(0);
        });

        setTimeout(() => {
          log.info(
            "[App] before quit -> logout timeout : quit"
          );
          app.exit(0);
        }, 10000);
      } else {
        app.exit(0);
      }
    } catch (error) {
      log.error("Error: " + error);
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
    log.error("WTF the GPU crashed : killed=" + killed);
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
        log.info("Qutting application");
        global.App.quit();
      }
    );
  }

  updateBadgeCount(number) {
    app.setBadgeCount(number);
  }
};
