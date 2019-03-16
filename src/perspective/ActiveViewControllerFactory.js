
import {SidePanelViewController} from "./SidePanelViewController";
import {MainPanelViewController} from "./MainPanelViewController";


export class ActiveViewControllerFactory {
  static viewsByName = {};

  static createViewController(name, scope) {
    return ActiveViewControllerFactory.findOrCreateViewController(name, scope);
  }

  static findOrCreateViewController(name, scope) {
    let storeFound = null;

    if (ActiveViewControllerFactory.viewsByName[name] != null) {
      storeFound = ActiveViewControllerFactory.viewsByName[name];
    } else {
      storeFound = ActiveViewControllerFactory.initializeNewViewController(name, scope);
      ActiveViewControllerFactory.viewsByName[name] = storeFound;
    }

    return storeFound;
  }

  static initializeNewViewController(name, scope) {
    switch (name) {
      case ActiveViewControllerFactory.Views.SIDE_PANEL:
        return new SidePanelViewController(scope);
      case ActiveViewControllerFactory.Views.MAIN_PANEL:
        return new MainPanelViewController(scope);

      default:
        return null;
    }
  }

  static get Views() {
    return {
      SIDE_PANEL: "side-panel",
      MAIN_PANEL: "main-panel"
    };
  }

}
