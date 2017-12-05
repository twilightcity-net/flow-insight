const { Menu, Tray } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

/*
 * This class is used to init the Application tray
 */
module.exports = class AppTray extends Tray {
  constructor() {
    log.info("[AppTray] created -> okay");
    super(Util.getAssetPath("/icons/icon.png"));
    let menu = Menu.buildFromTemplate([
      {
        label: "Report Bug",
        click() {
          log.info("[AppMenu] open report bug window");
          WindowManagerHelper.createWindowBugReport();
        }
      },
      { type: "separator" },
      {
        label: "Quit",
        role: "quit"
      }
    ]);
    this.setToolTip("MetaOS");
    this.setContextMenu(menu);
    return this;
  }
};
