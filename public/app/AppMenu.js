const {Menu} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");
const AppFeatureToggle = require("./AppFeatureToggle");


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
      label: AppFeatureToggle.appName,
      submenu: [
        {role: "about"},
        {type: "separator"},
        {
          label: "EnableFeatures",
          submenu: AppMenu.getFeatureSubmenu(),
        },
        {
          label: "Configure Hotkeys",
          click: AppMenu.onClickConfigHotkeys
        },
        {type: "separator"},
        {
          label: "Switch Communities",
          click: AppMenu.onClickSwitchCommunities
        },
        {
          label: "Use Invitation Key",
          click: AppMenu.onClickUseInvitationKey
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
        submenu: AppMenu.getHelpSubmenu(),
      },
    ];
  }

  static getHelpSubmenu() {
    if (AppFeatureToggle.isMoovieApp) {
      return [
        {
          label: "WatchMoovies - Learn More",
          click() {
            log.info(
              "[AppMenu] open browser-> http://watchmoovies.com/"
            );
            Util.openExternalBrowser("http://watchmoovies.com/");
          },
        },
      ];
    } else {
      return [
        {
          label: "FlowInsight - Learn More",
          click() {
            log.info(
              "[AppMenu] open browser-> http://flowinsight.com/"
            );
            Util.openExternalBrowser("http://flowinsight.com/");
          },
        },
      ];
    }
  }

  static getFeatureSubmenu() {
    return [
      {
        label: "Flow Metrics",
        click: () => {
          AppMenu.onClickFeature(AppFeatureToggle.Toggle.METRICS)
        },
        type: "checkbox",
        checked: AppMenu.isFeatureToggledOn(AppFeatureToggle.Toggle.METRICS)
      },
      {
        label: "Journal",
        click: () => {
          AppMenu.onClickFeature(AppFeatureToggle.Toggle.JOURNAL)
        },
        type: "checkbox",
        checked: AppMenu.isFeatureToggledOn(AppFeatureToggle.Toggle.JOURNAL)
      },
      {
        label: "Fervie Pairing",
        click: () => {
          AppMenu.onClickFeature(AppFeatureToggle.Toggle.FERVIE)
        },
        type: "checkbox",
        checked: AppMenu.isFeatureToggledOn(AppFeatureToggle.Toggle.FERVIE)
      },
      {
        label: "Neo Mode",
        click: () => {
          AppMenu.onClickFeature(AppFeatureToggle.Toggle.NEO)
        },
        type: "checkbox",
        checked: AppMenu.isFeatureToggledOn(AppFeatureToggle.Toggle.NEO)
      },
    ];
  }

  static getTemplateForMacOS() {
    return [
      {
        label: AppFeatureToggle.appName,
        submenu: [
          {role: "about"},
          {type: "separator"},
          {
            label: "EnableFeatures",
            submenu: AppMenu.getFeatureSubmenu(),
          },
          {
            label: "Configure Hotkeys",
            click: AppMenu.onClickConfigHotkeys
          },
          {type: "separator"},
          {
            label: "Switch Communities",
            click: AppMenu.onClickSwitchCommunities
          },
          {
            label: "Use Invitation Key",
            click: AppMenu.onClickUseInvitationKey
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
            label: "Displays",
            submenu: this.getDisplaysSubmenu(),
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
        role: "help",
        submenu: AppMenu.getHelpSubmenu(),
      },
    ];
  }

  static switchOrg = (orgId) => {
    console.log("switchOrg!");
  }

  static onClickFeature = (featureName) => {
    global.App.FeatureToggleManager.toggleFeature(featureName);
  }

  static isFeatureToggledOn = (featureName) => {
    return global.App.FeatureToggleManager.isFeatureToggledOn(featureName);
  }

  static onClickConfigHotkeys = () => {
    console.log("XXX onClickConfigHotkeys");

    WindowManagerHelper.createWindowHotkeyConfig();
  }

  static onClickUseInvitationKey = () => {
    console.log("XXX onClickUseInvitationKey");

    WindowManagerHelper.createWindowUseInvitationKey();
  }

  static onClickSwitchCommunities = () => {
    console.log("XXX onClickSwitchCommunities");

    WindowManagerHelper.createWindowOrgSwitch();
  }


  /**
   * gets the app menu for displays in the window section
   * @returns {*}
   */
  static getDisplaysSubmenu() {
    let displays = global.App.WindowManager.getDisplays(),
      defaultDisplay =
        global.App.AppSettings.getDisplayIndex(),
      arrLen = displays.length,
      menuItems = [],
      arrPos = 1,
      label = "";

    displays.forEach((display) => {
      label +=
        "Display " +
        arrPos +
        " - " +
        display.size.width +
        " x " +
        display.size.height;
      if (arrPos - 1 === defaultDisplay) {
        label += " •";
      }
      menuItems.push({
        label: label,
        index: arrPos - 1,
        click: (event) => {
          console.log(event);
          global.App.AppSettings.setDisplayIndex(
            event.index
          );
        },
      });
      arrPos += 1;
      label = "";
    });
    return menuItems;
  }
};
