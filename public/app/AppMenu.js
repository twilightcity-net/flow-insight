const { Menu } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

/*
 * This class is used to init the Application menu. mac only now
 */
module.exports = class AppMenu extends Menu {
  constructor() {
    super();
    log.info("[AppMenu] create menu from template");
    return Menu.buildFromTemplate(this.getTemplateMacOS());
  }

  /*
   * returns the default template for our mac os menu
   */
  getTemplateMacOS() {
    return [
      {
        label: Util.getAppName(),
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
              log.info("[AppMenu] open browser-> http://www.openmastery.org/");
              Util.openExternalBrowser("http://www.openmastery.org/");
            }
          },
          {
            label: "Report bug",
            click() {
              log.info("[AppMenu] open report bug window");
              WindowManagerHelper.createWindowBugReport();
            }
          }
        ]
      }
    ];
  }
};
