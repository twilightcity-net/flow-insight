import { SidePanelViewController } from "./SidePanelViewController";
import { MainPanelViewController } from "./MainPanelViewController";
import { ConsoleViewController } from "./ConsoleViewController";
import { ResourceCircuitController } from "./ResourceCircuitController";
import { BrowserController } from "./BrowserController";
import {NotificationController} from "./NotificationController";

/**
 * generates view controllers for components
 * @author ZoeDreams
 */
export class RendererControllerFactory {
  /**
   * an array of views store as a cluttered object list in memory
   * @type {{}}
   */
  static controllers = {};

  /**
   * the views of the gui that have controllers
   * @returns {{RESOURCES: string, LAYOUT_CONTENT: string, CONSOLE_VIEW: string, CONSOLE_SIDEBAR: string}}
   * @constructor
   */
  static get Views() {
    return {
      CONSOLE_VIEW: "console-view",
      CONSOLE_SIDEBAR: "console-sidebar",
      LAYOUT_CONTENT: "layout-content",
      LAYOUT_BROWSER: "layout-browser",
      RESOURCES: "resources",
      NOTIFICATION: "notification"
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
      let controller =
        RendererControllerFactory.controllers[name];
      if (controller) {
        controller = controller.updateScope(scope);
      } else {
        controller = RendererControllerFactory.controllers[
          name
        ] = RendererControllerFactory.createController(
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
   * @returns {ResourceCircuitController|BrowserController|MainPanelViewController|ConsoleViewController|SidePanelViewController}
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
        return new NotificationController(scope);
      default:
        throw new Error(
          "Unknown controller name '" + name + "'"
        );
    }
  }
}
