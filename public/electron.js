/*
 * Electron Node Required Packages
 */
const { app, BrowserWindow, ipcMain, Menu, Tray } = require("electron"),
  path = require("path"),
  isDev = require("electron-is-dev"),
  notifier = require("node-notifier"),
  log = require("electron-log");

/*
 * Project Required Packages
 */
const WindowManager = require("./WindowManager"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  SlackManager = require("./SlackManager"),
  { EventManager, MainEvent } = require("./EventManager"),
  AppUpdater = require("./AppUpdater"),
  AppLoader = require("./AppLoader");

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
  app.setName("MetaOS");
  initLogger();
  WindowManager.init();
  EventManager.init();
  SlackManager.init();
  AppLoader.init();
  AppUpdater.init();
  // TODO move these into AppLoader.init()
  // createTray();
  createMenu();
  WindowManager.createWindowLoading();
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
 * Creates the app's menu for MacOS
 * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
 */
function createMenu() {
  if (process.platform !== "darwin") return;
  let menu = null;
  const template = [
    {
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services", submenu: [] },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      role: "window",
      submenu: [
        { role: "close" },
        { role: "minimize" },
        { type: "separator" },
        { role: "front" }
      ]
    },
    {
      role: "help",
      submenu: [
        {
          label: "MetaOS - Learn More",
          click() {
            require("electron").shell.openExternal(
              "http://www.openmastery.org/"
            );
          }
        },
        {
          label: "Report bug",
          click() {
            WindowManager.createWindowBugReport();
          }
        }
      ]
    }
  ];
  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
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
