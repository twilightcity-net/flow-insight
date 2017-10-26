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
  Logger.init();
  log.info("[App] ready -> " + Util.getAppName());
  app.setName(Util.getAppName());
  WindowManager.init();
  EventManager.init();
  ShortcutManager.init();
  SlackManager.init();
  AppUpdater.init();
  AppLoader.init();
}

/*
 * application has become active.. mac os
 */
function onAppActivateCb() {
  log.info("[App] Activate Application");
}

/*
 * console window should always be opened.. quit if force closed
 */
function onAppWindowAllCloseCb() {
  if (platform.isDarwin) {
    log.info("[App] Window All Closed -> quit");
    app.quit();
  }
}
