const {Menu} = require("electron"),
  log = require("electron-log"),
  Util = require("../Util"),
  WindowManagerHelper = require("../managers/WindowManagerHelper");
const AppConfig = require("./AppConfig");



module.exports = class MenuHandler {
  constructor() {
  }

  static getFeatureSubmenu() {
    if (AppConfig.isFlowInsightApp()) {
      return MenuHandler.getFeatureSubmenuForFlowInsight();
    } else if (AppConfig.isFlowJournalApp()) {
      return MenuHandler.getFeatureSubmenuForFlowJournal();
    } else {
      return [];
    }
  }

  static getFeatureSubmenuForFlowJournal() {
    return [
      {
        label: "Focus Bar",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.STATUS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.STATUS)
      },
    ];
  }

  static getFeatureSubmenuForFlowInsight() {
    return [
      {
        label: "Journal",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.JOURNAL)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.JOURNAL)
      },
      {
        label: "Flow Metrics",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.METRICS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.METRICS)
      },
      {
        label: "Flow Dashboard",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.DASHBOARD)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.DASHBOARD)
      },
      {
        label: "Focus Bar",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.STATUS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.STATUS)
      },
      {
        label: "Trouble Control",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.CONTROL)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.CONTROL)
      },
      {
        label: "Fervie Welcome",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.FERVIE_WELCOME)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.FERVIE_WELCOME)
      },
      {
        label: "Fervie Teams",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.FERVIE)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.FERVIE)
      },
      {
        label: "Neo Mode",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.NEO)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.NEO)
      },
      {type: "separator"},
      {
        label: "Individual Mode",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.INDIVIDUAL)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.INDIVIDUAL)
      },
      {
        label: "Plugin Extensions",
        click: () => {
          MenuHandler.onClickFeature(AppConfig.Toggle.TOOLS)
        },
        type: "checkbox",
        checked: MenuHandler.isFeatureToggledOn(AppConfig.Toggle.TOOLS)
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
    if (AppConfig.isMoovieApp()) {
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
