
import {ActiveViewControllerFactory} from "./ActiveViewControllerFactory";
import {MainPanelMenuViewController} from "./SidePanelMenuViewController";

//
// this class is used to manage DataClient requests for Stores
//
export class PerspectiveCoordinator {

  constructor(scope) {
    this.name = this.constructor.name;
    this.scope = scope;
  }

  wireViewControllersTogether = () => {

    this.sidePanelMenu = ActiveViewControllerFactory.createViewController(ActiveViewControllerFactory.Views.SIDE_PANEL, this);
    this.sidePanelContent = ActiveViewControllerFactory.createViewController(ActiveViewControllerFactory.Views.SIDE_PANEL_CONTENT, this);

    //event wirings

    this.onChangeSidePanelUpdateMenuAndContent();

  };

  unregisterControllerWirings = () => {
    this.sidePanelMenu.unregisterAllListeners(this.name);
    this.sidePanelContent.unregisterAllListeners(this.name);
  };

  onChangeSidePanelUpdateMenuAndContent() {
    this.sidePanelMenu.registerListener(this.name, MainPanelMenuViewController.CallbackEvent.ACTIVE_CIRCLE_UPDATE,
      () => {
        console.log("PerspectiveCoordinator Event Fired: onChangeSidePanelUpdateMenuAndContent");
        //do a thing
      });
  }



}
