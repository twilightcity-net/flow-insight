const { Menu, Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util");
const WindowManagerHelper = require("../managers/WindowManagerHelper");

/*
 * This class is used to init the Application tray
 */
module.exports = class AppTray extends Tray {
  constructor() {
    log.info("[AppTray] created -> okay");
    let iconPath = Util.getAssetPath("/icons/icon.png");
    if (process.platform === "darwin") {
      // ??? Why didn't this work according to https://www.christianengvall.se/electron-app-icons/
      // iconPath = Util.getAssetPath("/icons/mac/icon.icns");
      iconPath = Util.getAssetPath(
        "/icons/mac/png/icon.png"
      );
    } else if (process.platform === "win32") {
      iconPath = Util.getAssetPath("/icons/win/icon.ico");
    }
    log.info(`[AppTray] iconPath=${iconPath}`);
    super(iconPath);
    let menu = Menu.buildFromTemplate([
      {
        label: "Configure Hotkeys",
        click: this.onClickConfigHotkeys
      },
      { type: "separator" },
      {
        label: "Quit",
        role: "quit",
      }
    ]);
    this.setToolTip("Flow Insight");
    this.setContextMenu(menu);
    this.on("click", (event, bounds, position) => {
      log.info("[AppTray] tray event -> click");
    });
    this.on("right-click", (event, bounds) => {
      log.info("[AppTray] tray event -> right-click");
    });
    return this;
  }

  onClickConfigHotkeys = () => {
    console.log("XXX onClickConfigHotkeys");

    WindowManagerHelper.createWindowHotkeyConfig();
  }
};
