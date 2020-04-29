const Updater = require("electron-updater").autoUpdater,
  log = require("electron-log"),
  platform = require("electron-platform"),
  isDev = require("electron-is-dev");

/*
 * This is the controller class for the application updater. Linux distributions
 * should use the built in package manager for update? Maybe not.. need testing.
 */
module.exports = class AppUpdater {
  constructor() {
    log.info("[AppUpdater] created -> okay");

    // disable updates for linux and dev mode
    if (isDev || process.platform === "linux") return;

    Updater.autoDownload = false;

    Updater.on("checking-for-update", () => {
      log.info("Checking for update...");
    });
    Updater.on("update-available", info => {
      log.info("Update available.");
    });
    Updater.on("update-not-available", info => {
      log.info("Update not available.");
    });
    Updater.on("error", err => {
      log.error("Error in auto-updater.");
    });
    Updater.on("download-progress", progressObj => {
      let logMsg =
        "Download speed: " + progressObj.bytesPerSecond;
      logMsg =
        logMsg +
        " - Downloaded " +
        progressObj.percent +
        "%";
      logMsg =
        logMsg +
        " (" +
        progressObj.transferred +
        "/" +
        progressObj.total +
        ")";
      log.info(logMsg);
    });
    Updater.on("update-downloaded", info => {
      log.info("Update downloaded");
    });
  }

  /*
   * setup auto-update and check for updates. Called from createWindow()
   * see -> https://electron.atom.io/docs/all/#apprelaunchoptions
   */
  static startUpdate() {
    if (isDev || !(platform.isWin32 || platform.isDarwin))
      return;
    Updater.checkForUpdates();
  }
};
