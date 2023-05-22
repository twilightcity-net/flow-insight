const { Menu, Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util");
const WindowManagerHelper = require("../managers/WindowManagerHelper");
const AppFeatureToggle = require("./AppFeatureToggle");
const MenuHandler = require("./MenuHandler");

/*
 * This class is used to init the Application tray
 */
module.exports = class AppTray extends Tray {
  constructor() {
    log.info("[AppTray] created -> okay");
    let iconPath;
    if (process.platform === "darwin") {
      if (AppFeatureToggle.isMoovieApp) {
        iconPath = Util.getAssetPath("/icons/moovies/iconTemplate.png");
      } else {
        iconPath = Util.getAssetPath("/icons/mac/iconTemplate.png");
      }
    } else if (process.platform === "win32") {
      if (AppFeatureToggle.isMoovieApp) {
        iconPath = Util.getAssetPath("/icons/moovies/iconTemplate.ico");
      } else {
        iconPath = Util.getAssetPath("/icons/win/icon.ico");
      }
    } else {
      if (AppFeatureToggle.isMoovieApp) {
        iconPath = Util.getAssetPath("/icons/moovies/iconTemplate.png");
      } else {
        iconPath = Util.getAssetPath("/icons/iconTemplate.png");
      }
    }
    log.info(`[AppTray] iconPath=${iconPath}`);
    super(iconPath);
    let menu = Menu.buildFromTemplate([
      {
        label: "Configure Hotkeys",
        click: this.onClickConfigHotkeys
      },
      {
        label: "Enable Features",
        submenu: MenuHandler.getFeatureSubmenu(),
      },
      {
        role: "displays",
        label: "Choose Primary Display",
        submenu: MenuHandler.getDisplaysSubmenu(),
      },
      {type: "separator"},
      {
        label: "Switch Communities",
        click: MenuHandler.onClickSwitchCommunities
      },
      {
        label: "Use Invitation Key",
        click: MenuHandler.onClickUseInvitationKey
      },
      { type: "separator" },
      {
        role: "help",
        submenu: MenuHandler.getHelpSubmenu(),
      },
      {
        label: "Quit",
        role: "quit",
      }
    ]);

    this.setToolTip(AppFeatureToggle.appName);

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
