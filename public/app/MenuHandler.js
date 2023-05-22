const {Menu} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");
const AppFeatureToggle = require("./AppFeatureToggle");



module.exports = class MenuHandler {
  constructor() {
  }

  static getFeatureSubmenu() {
    return [
      {
        label: "Journal",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.JOURNAL)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.JOURNAL)
      },
      {
        label: "Flow Metrics",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.METRICS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.METRICS)
      },
      {
        label: "Flow Dashboard",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.DASHBOARD)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.DASHBOARD)
      },
      {
        label: "Focus Bar",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.STATUS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.STATUS)
      },
      {
        label: "Trouble Control",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.CONTROL)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.CONTROL)
      },
      {
        label: "Fervie",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.FERVIE)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.FERVIE)
      },
      {
        label: "Neo Mode",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.NEO)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.NEO)
      },
      {type: "separator"},
      {
        label: "Plugin Extensions",
        click: () => {
          MenuHandler.onClickFeature(AppFeatureToggle.Toggle.TOOLS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppFeatureToggle.Toggle.TOOLS)
      },
    ];
  }

  static onClickFeature = (featureName) => {
    global.App.FeatureToggleManager.toggleFeature(featureName);
  }

  static isFeatureToggledOn = (featureName) => {
    return global.App.FeatureToggleManager.isFeatureToggledOn(featureName);
  }

  static onClickSwitchCommunities = () => {
    console.log("XXX onClickSwitchCommunities");

    WindowManagerHelper.createWindowOrgSwitch();
  }

  static onClickUseInvitationKey = () => {
    console.log("XXX onClickUseInvitationKey");

    WindowManagerHelper.createWindowUseInvitationKey();
  }

  static onClickConfigHotkeys = () => {
    console.log("XXX onClickConfigHotkeys");

    WindowManagerHelper.createWindowHotkeyConfig();
  }


  static getHelpSubmenu() {
    if (AppFeatureToggle.isMoovieApp) {
      return [
        { role: "about" },
        {
          label: "Learn more at watchmoovies.com",
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
        { role: "about" },
        {
          label: "Learn more at flowinsight.com",
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
