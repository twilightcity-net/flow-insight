const { Menu, Tray } = require("electron"),
  Util = require("./Util"),
  log = require("electron-log"),
  WindowManager = require("./WindowManager"),
  assetsDirectory = path.join(__dirname, "assets"),
  applicationIcon = assetsDirectory + "/icons/icon.ico",
  trayIcon = assetsDirectory + "/icons/icon.png";

/*
 * This class is used to init the Application loading
 */
module.exports = class AppLoader {
  /*
   * called to initialize the loader
   */
  static init() {
    log.info("Initialize AppLoader");
    this.tray = null;
    this.createTray();
    this.createMenu();
    WindowManager.createWindowLoading();
  }

  /*
   * Creates the app's menu for MacOS
   * Ref. https://electron.atom.io/docs/api/menu/#notes-on-macos-application-menu
   */
  // TODO move to its own class
  static createMenu() {
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
  // TODO move to its own class
  static createTray() {
    this.tray = new Tray(trayIcon);
    this.tray.on("click", (event, bounds, position) => {
      log.info("[Tray] tray event -> click");
    });
    this.tray.on("right-click", (event, bounds) => {
      log.info("[Tray] tray event -> right-click");
    });
    this.tray.on("double-click", (event, bounds) => {
      log.info("[Tray] tray event -> double-click");
    });
  }
};
