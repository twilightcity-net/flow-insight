/*
 * Electron Node Required Packages
 */
const { app, BrowserWindow, ipcMain } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  WindowManager = require("./WindowManager"),
  SlackManager = require("./SlackManager"),
  { EventManager } = require("./EventManager"),
  AppLoader = require("./AppLoader"),
  AppUpdater = require("./AppUpdater");

/*
 * Application Events
 */
// TODO implement https://electron.atom.io/docs/all/#appmakesingleinstancecallback
app.on("ready", onAppReadyCb);
app.on("activate", onAppActivateCb); // macOS
app.on("window-all-closed", onAppWindowAllCloseCb);

/*
 * Event Callback Functions
 */
function onAppReadyCb() {
  app.setName("MetaOS");
  initLogger();
  WindowManager.init();
  EventManager.init();
  SlackManager.init();
  AppLoader.init();
  AppUpdater.init();
}

// FIXME doesn't work, untested
function onAppActivateCb() {}

// FIXME dont think we want to do this, quit done from tray or app menu
function onAppWindowAllCloseCb() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

/*
 * configures our logging utility on startup
 */
// TODO move to logging class
function initLogger() {
  let level = "info";
  if (isDev) {
    level = "debug";
    log.transports.file.file = `${path.join(app.getAppPath() + "/debug.log")}`;
  }
  log.transports.file.level = level;
  log.transports.console.level = level;
}
