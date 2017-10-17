const { BrowserWindow } = require("electron"),
  isDev = require("electron-is-dev"),
  path = require("path"),
  ViewManagerHelper = require("./ViewManagerHelper"),
  assetsDirectory = path.join(__dirname, "assets"),
  applicationIcon = assetsDirectory + "/icons/icon.ico";

/*
 * the main application window for UX. Suspose to slide in and out of 
 * the top of the screen with a global hot key
 */
module.exports = class ConsoleWindow {
  constructor(WindowManager) {
    this.manager = WindowManager;
    this.name = WindowManager.WindowNames.CONSOLE;
    this.view = ViewManagerHelper.ViewNames.CONSOLE;
    this.url = WindowManager.getWindowViewURL(this.view);

    // the main window for view content
    this.window = new BrowserWindow({
      name: this.name,
      width: 900,
      height: 680,
      show: false,
      backgroundColor: "#ffffff",
      icon: applicationIcon,
      fullscreenable: false,
      webPreferences: { devTools: isDev, toolbar: false }
    });

    // do not show a menu
    this.window.setMenu(null);
  }
};
