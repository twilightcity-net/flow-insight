/*
 * Electron Node Required Packages
 */
const { app, BrowserWindow, ipcMain, Tray } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  notifier = require("node-notifier"),
  log = require("electron-log"),
  autoUpdater = require("electron-updater").autoUpdater;

/*
 * Project Required Packages
 */
const WindowManager = require("./WindowManager"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  { EventManager, MainEvent, MainEventException } = require("./EventManager");

/*
 * Global Constants
 */
const assetsDirectory = path.join(__dirname, "assets"),
  applicationIcon = assetsDirectory + "/icons/icon.ico",
  trayIcon = assetsDirectory + "/icons/icon.png";

/*
 * Global Objects
 */
let tray;

/*
 * Application Events
 */
// TODO move to its own app Class, and call one function to start
// TODO implement https://electron.atom.io/docs/all/#appmakesingleinstancecallback
app.on("ready", onAppReadyCb);
app.on("activate", onAppActivateCb); // macOS
app.on("window-all-closed", onAppWindowAllCloseCb);

/*
 * Event Callback Functions
 */
function onAppReadyCb() {
  initLogger();
  WindowManager.init();
  EventManager.init();
  testEventManager();
  WindowManager.createWindowLoading();
  // TODO need to refactor these into classes and change loading order
  // createTray();
  // initAutoUpdate();
}

// FIXME doesn't work, untested
function onAppActivateCb() {}

// FIXME dont think we want to do this, quit done from tray or app menu
function onAppWindowAllCloseCb() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

// TODO move tray stuff to its own AppTray Class
function onTrayRightClickCb() {}

function onTrayDoubleClickCb() {}

function onTrayClickCb(event) {}

/*
 * Creates the system tray object and icon. Called by onAppReadyCb()
 */
function createTray() {
  tray = new Tray(trayIcon);
  tray.on("right-click", onTrayRightClickCb);
  tray.on("double-click", onTrayDoubleClickCb);
  tray.on("click", onTrayClickCb);
}

/*
 * configures our logging utility on startup
 */
function initLogger() {
  let level = "info";
  if (isDev) {
    level = "debug";
    log.transports.file.file = `${path.join(app.getAppPath() + "/debug.log")}`;
  }
  log.transports.file.level = level;
  log.transports.console.level = level;
}

/*
 * setup auto-update and check for updates. Called from createWindow()
 * see -> https://electron.atom.io/docs/all/#apprelaunchoptions
*/
// TODO move to its own AppUpdater Class
function initAutoUpdate() {
  // skip update if we are in linux or dev mode
  if (isDev) {
    return;
  }
  if (process.platform === "linux") {
    return;
  }

  autoUpdater.autoDownload = false;

  // configure update logging to file
  autoUpdater.log = log;
  autoUpdater.log.transports.file.level = "info";

  autoUpdater.on("checking-for-update", () => {
    autoUpdater.log.info("Checking for update...");
  });
  autoUpdater.on("update-available", info => {
    autoUpdater.log.info("Update available.");
  });
  autoUpdater.on("update-not-available", info => {
    autoUpdater.log.info("Update not available.");
  });
  autoUpdater.on("error", err => {
    autoUpdater.log.error("Error in auto-updater.");
  });
  autoUpdater.on("download-progress", progressObj => {
    let logMsg = "Download speed: " + progressObj.bytesPerSecond;
    logMsg = logMsg + " - Downloaded " + progressObj.percent + "%";
    logMsg =
      logMsg + " (" + progressObj.transferred + "/" + progressObj.total + ")";
    autoUpdater.log.info(logMsg);
  });
  autoUpdater.on("update-downloaded", info => {
    autoUpdater.log.info("Update downloaded");
  });

  // check for updates and notify if we have a new version
  autoUpdater.checkForUpdates();
}

//TESTING LOGIC
function testEventManager() {
  log.info("EventManager : test()");

  let testEventA = new MainEvent(
    EventManager.EventTypes.TEST_EVENT,
    this,
    function(event, arg) {
      log.info("test-eventA : callback -> hello from A : " + arg);
      return arg;
    },
    null
  );
  let testEventB = new MainEvent(
    EventManager.EventTypes.TEST_EVENT,
    this,
    function(event, arg) {
      log.info("test-eventB : callback -> hello from B : " + arg);
      return arg;
    },
    function(event, arg) {
      log.info("test-eventB : reply -> hello from B : " + arg);
      return arg;
    }
  );
  let testEventC = new MainEvent(
    EventManager.EventTypes.TEST_EVENT,
    this,
    function(event, arg) {
      log.info("test-eventC : callback -> hello from C : " + arg);
      return arg;
    },
    function(event, arg) {
      log.info("test-eventC : reply -> hello from C : " + arg);
      return arg;
    }
  );

  EventManager.registerEvent(testEventA);
  EventManager.registerEvent(testEventB);
  EventManager.registerEvent(testEventC);
  EventManager.unregisterEvent(testEventB);

  EventManager.dispatch(EventManager.EventTypes.TEST_EVENT, 1);
}
