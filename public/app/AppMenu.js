const {Menu} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");
const AppConfig = require("./AppConfig");
const MenuHandler = require("./MenuHandler");


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
    let template = AppMenu.getTemplate();
    let built = Menu.buildFromTemplate(template);
    return built;
  }

  static getTemplate() {
    switch (process.platform) {
      case "darwin":
        return AppMenu.getTemplateForMacOS();
      case "win32":
        return AppMenu.getTemplateForWindows();
    }
    // TODO: determine if there are any other platforms we ought to support; e.g. linux.  In the meantime, throw
    throw new AppMenuException();
  }

  static getTemplateForWindows() {
    return [{
      label: AppConfig.appName,
      submenu: [
        {role: "about"},
        {type: "separator"},
        {
          label: "Configure Hotkeys",
          click: MenuHandler.onClickConfigHotkeys
        },
        {
          label: "Enable Features",
          submenu: MenuHandler.getFeatureSubmenu(),
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
        {type: "separator"},
        {role: "quit"},
      ],
    },
      {
        label: "Edit",
        submenu: [
          {role: "undo"},
          {role: "redo"},
          {type: "separator"},
          {role: "cut"},
          {role: "copy"},
          {role: "paste"},
          {role: "pasteandmatchstyle"},
          {role: "delete"},
          {role: "selectall"},
        ],
      },
      {
        role: "window",
        submenu: [{role: "minimize"}, {role: "close"}],
      },
      {
        role: "help",
        submenu: MenuHandler.getHelpSubmenu(),
      },
    ];
  }


  static getTemplateForMacOS() {
    return [
      {
        label: AppConfig.appName,
        submenu: [
          {role: "about"},
          {type: "separator"},
          {
            label: "EnableFeatures",
            submenu: MenuHandler.getFeatureSubmenu(),
          },
          {
            label: "Configure Hotkeys",
            click: MenuHandler.onClickConfigHotkeys
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
          {type: "separator"},
          {role: "hide"},
          {role: "hideothers"},
          {role: "unhide"},
          {type: "separator"},
          {role: "quit"},
        ],
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            accelerator: "CmdOrCtrl+Z",
            selector: "undo:",
          },
          {
            label: "Redo",
            accelerator: "Shift+CmdOrCtrl+Z",
            selector: "redo:",
          },
          {type: "separator"},
          {
            label: "Cut",
            accelerator: "CmdOrCtrl+X",
            selector: "cut:",
          },
          {
            label: "Copy",
            accelerator: "CmdOrCtrl+C",
            selector: "copy:",
          },
          {
            label: "Paste",
            accelerator: "CmdOrCtrl+V",
            selector: "paste:",
          },
          {
            label: "Select All",
            accelerator: "CmdOrCtrl+A",
            selector: "selectAll:",
          },
        ],
      },
      {
        role: "window",
        submenu: [
          {
            role: "displays",
            label: "Choose Primary Display",
            submenu: MenuHandler.getDisplaysSubmenu(),
          },
          {type: "separator"},
          {role: "close"},
          {role: "minimize"},
          {type: "separator"},
          {role: "front"},
          {type: "separator"},
        ],
      },
      {
        label: "Help",
        submenu: MenuHandler.getHelpSubmenu(),
      },
    ];
  }


};
