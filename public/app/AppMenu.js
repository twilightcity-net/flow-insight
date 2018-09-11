const { Menu } = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");

const helpSubmenu = [
  {
    label: "Torchie - Learn More",
    click() {
      log.info("[AppMenu] open browser-> http://www.dreamscale.io/");
      Util.openExternalBrowser("http://www.dreamscale.io/");
    }
  },
  {
    label: "Report bug",
    click() {
      log.info("[AppMenu] open report bug window");
      WindowManagerHelper.createWindowBugReport();
    }
  }
];

class AppMenuException extends Error {
  constructor(
    msg = `Could not build the app menu for this platform (${process.platform})`,
    ...params
  ) {
    super(msg, ...params);
    this.msg = msg;
    log.error(`[AppMenu] ${msg}`);
    this.platform = process.platform; // In case the catcher needs it
  }
}

module.exports = class AppMenu extends Menu {
  constructor() {
    super();
    log.info("[AppMenu] create menu from template");
    return Menu.buildFromTemplate(this.getTemplate());
  }

  getTemplate() {
    switch (process.platform) {
      case "darwin":
        return this.getTemplateForMacOS();
      case "win32":
        return this.getTemplateForWindows();
    }
    // TODO: determine if there are any other platforms we ought to support; e.g. linux.  In the meantime, throw
    throw new AppMenuException();
  }

  getTemplateForWindows() {
    return [
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "pasteandmatchstyle" },
          { role: "delete" },
          { role: "selectall" }
        ]
      },
      {
        role: "window",
        submenu: [{ role: "minimize" }, { role: "close" }]
      },
      {
        role: "help",
        submenu: helpSubmenu
      }
    ];
  }

  getTemplateForMacOS() {
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
        submenu: helpSubmenu
      }
    ];
  }
};
