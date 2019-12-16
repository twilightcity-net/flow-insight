import {SidePanelViewController} from "./SidePanelViewController";
import {MainPanelViewController} from "./MainPanelViewController";
import {ConsoleViewController} from "./ConsoleViewController";
import {TroubleshootController} from "./TroubleshootController";

/**
 * generates view controllers for components
 * @author ZoeDreams
 */
export class ActiveViewControllerFactory {

  /**
   * an array of views store as a cluttered object list in memory
   * @type {{}}
   */
  static viewsByName = {};

  /**
   * the views of the gui that have controllers
   * @returns {{TROUBLE_PANEL: string, MAIN_PANEL: string, CONSOLE_PANEL: string, SIDE_PANEL: string}}
   * @constructor
   */
  static get Views() {
    return {
      TROUBLE_PANEL: "trouble-panel",
      SIDE_PANEL: "side-panel",
      MAIN_PANEL: "main-panel",
      CONSOLE_PANEL: "console-panel"
    };
  }

  /**
   * helper function to create a new view controller
   * @param name - the name of the controller to load
   * @param scope - the given scope
   * @returns {*} - the controller instance
   */
  static createViewController(name, scope) {
    return ActiveViewControllerFactory.findOrCreateViewController(name, scope);
  }

  /**
   * looks up the controller in a static array of this class
   * @param name
   * @param scope
   * @returns {*}
   */
  static findOrCreateViewController(name, scope) {
    let storeFound = null;
    if (ActiveViewControllerFactory.viewsByName[name] != null) {
      storeFound = ActiveViewControllerFactory.viewsByName[name];
    }
    else {
      storeFound = ActiveViewControllerFactory.initializeNewViewController(
        name,
        scope
      );
      ActiveViewControllerFactory.viewsByName[name] = storeFound;
    }
    return storeFound;
  }

  /**
   * creates a new initialized controller with the given scope
   * @param name - the name of the controller
   * @param scope - the given scope to create in
   * @returns {ConsoleViewController|TroubleshootController|MainPanelViewController|null|SidePanelViewController}
   */
  static initializeNewViewController(name, scope) {
    switch (name) {
      case ActiveViewControllerFactory.Views.TROUBLE_PANEL:
        return new TroubleshootController(scope);
      case ActiveViewControllerFactory.Views.SIDE_PANEL:
        return new SidePanelViewController(scope);
      case ActiveViewControllerFactory.Views.MAIN_PANEL:
        return new MainPanelViewController(scope);
      case ActiveViewControllerFactory.Views.CONSOLE_PANEL:
        return new ConsoleViewController(scope);
      default:
        return null;
    }
  }
}
