const { app } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  log = require("electron-log"),
  Util = require("./Util"),
  WindowManager = require("./WindowManager"),
  SlackManager = require("./SlackManager"),
  { EventManager, MainEvent } = require("./EventManager"),
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
  log.info("[App] ready -> " + Util.getAppName());
  app.setName("MetaOS");
  initLogger();
  WindowManager.init();
  EventManager.init();
  SlackManager.init();
  AppUpdater.init();
  AppLoader.init();
  testEventManager();
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
  if (process.platform !== "darwin") {
    log.info("[App] Window All Closed -> quit");
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
  log.info("[Logger] Initialized");
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
    null,
    true
  );

  let value = 1;
  function intervalFunc() {
    testEventA.dispatch(value);
    value++;
  }
  setInterval(intervalFunc, 10000);
}
