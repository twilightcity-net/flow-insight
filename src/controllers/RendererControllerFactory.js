import { SidePanelViewController } from "./SidePanelViewController";
import { MainPanelViewController } from "./MainPanelViewController";
import { ConsoleViewController } from "./ConsoleViewController";
import { ResourceCircuitController } from "./ResourceCircuitController";
import { BrowserController } from "./BrowserController";
import { PopupController } from "./PopupController";
import { ChartPopoutController } from "./ChartPopoutController";
import {HotkeyViewController} from "./HotkeyViewController";
import {InvitationViewController} from "./InvitationViewController";
import {OrgSwitcherViewController} from "./OrgSwitcherViewController";
import {DMPopoutController} from "./DMPopoutController";

/**
 * generates view controllers for components, handling the delegation
 * of events to support various views
 */
export class RendererControllerFactory {
  /**
   * an array of views store as a cluttered object list in memory
   * @type {{}}
   */
  static controllers = {};

  /**
   * the views of the gui that have controllers
   * @constructor
   */
  static get Views() {
    return {
      CONSOLE_VIEW: "console-view",
      CONSOLE_SIDEBAR: "console-sidebar",
      LAYOUT_CONTENT: "layout-content",
      LAYOUT_BROWSER: "layout-browser",
      RESOURCES: "resources",
      NOTIFICATION: "notification",
      CHART_POPOUT: "chart-popout",
      HOTKEY_CONFIG: "hotkey-config",
      INVITATION_KEY: "invitation-key",
      ORG_SWITCHER: "org-switcher",
      DM_POPOUT: "dm-popout"
    };
  }

  /**
   * helper function to create a new view controller
   * @param name - the name of the controller to load
   * @param scope - the given scope
   * @returns {*} - the controller instance
   */
  static getViewController(name, scope) {
    return RendererControllerFactory.findOrCreateController(
      name,
      scope
    );
  }

  /**
   * looks up the controller in a static array of this class
   * @param name
   * @param scope
   * @returns {*}
   */
  static findOrCreateController(name, scope) {
    if (name) {
      let controller = RendererControllerFactory.controllers[name];
      if (controller) {
        controller = controller.updateScope(scope);
      } else {
        controller = RendererControllerFactory.controllers[name] =
          RendererControllerFactory.createController(
          name,
          scope
        );
      }
      if (!controller) {
        throw new Error(
          "the null controller with num-chucks is dangerous"
        );
      }
      return controller;
    } else {
      throw new Error("null controller name disallowed");
    }
  }

  /**
   * creates a new initialized controller with the given scope
   * @param name
   * @param scope
   */
  static createController(name, scope) {
    switch (name) {
      case RendererControllerFactory.Views.RESOURCES:
        return new ResourceCircuitController(scope);
      case RendererControllerFactory.Views.CONSOLE_SIDEBAR:
        return new SidePanelViewController(scope);
      case RendererControllerFactory.Views.LAYOUT_CONTENT:
        return new MainPanelViewController(scope);
      case RendererControllerFactory.Views.CONSOLE_VIEW:
        return new ConsoleViewController(scope);
      case RendererControllerFactory.Views.LAYOUT_BROWSER:
        return new BrowserController(scope);
      case RendererControllerFactory.Views.NOTIFICATION:
        return new PopupController(scope);
      case RendererControllerFactory.Views.CHART_POPOUT:
        return new ChartPopoutController(scope);
      case RendererControllerFactory.Views.DM_POPOUT:
        return new DMPopoutController(scope);
      case RendererControllerFactory.Views.HOTKEY_CONFIG:
        return new HotkeyViewController(scope);
      case RendererControllerFactory.Views.INVITATION_KEY:
        return new InvitationViewController(scope);
      case RendererControllerFactory.Views.ORG_SWITCHER:
        return new OrgSwitcherViewController(scope);
      default:
        throw new Error(
          "Unknown controller name '" + name + "'"
        );
    }
  }
}
