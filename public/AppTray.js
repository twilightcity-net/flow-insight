const { Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("./Util");

/*
 * This class is used to init the Application tray
 */
module.exports = class AppTray extends Tray {
  constructor() {
    log.info("[AppTray] create tray");
    super(Util.getAssetPath("/icons/icon.png"));
    this.on("click", (event, bounds, position) => {
      log.info("[AppTray] tray event -> click");
    });
    this.on("right-click", (event, bounds) => {
      log.info("[AppTray] tray event -> right-click");
    });
    this.on("double-click", (event, bounds) => {
      log.info("[AppTray] tray event -> double-click");
    });
    return this;
  }
};
