import { DataModelFactory } from "../models/DataModelFactory";
import { ActiveViewControllerFactory } from "./ActiveViewControllerFactory";
import ConsoleView from "../views/ConsoleView";

/**
 * This class is used to coordinate views across all the perspective change events
 */
export class PerspectiveController {
  constructor(scope) {
    this.name = "[PerspectiveController]";
    this.scope = scope;
  }

  static instance;

  /**
   * static function used to initialize this con
   * @param scope
   */
  static init(scope) {
    if (!PerspectiveController.instance) {
      PerspectiveController.instance = new PerspectiveController(scope);
      PerspectiveController.instance.wireViewControllersTogether();
    }
  }

  /**
   * links dependent controllers to this controllers scope
   */
  wireViewControllersTogether = () => {
    this.journalModel = DataModelFactory.createModel(
      DataModelFactory.Models.JOURNAL,
      this
    );
    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
    this.myController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.MAIN_PANEL,
      this
    );

    this.sidePanelController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL,
      this
    );
    this.consoleController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.CONSOLE_PANEL,
      this
    );
    this.configureConsoleOpenCloseModelUpdateEvents();
    this.configureSidePanelCloseEvent();
  };

  /**
   * callback function called when the sidebar panel is closed
   */
  configureSidePanelCloseEvent() {
    this.sidePanelController.configurePerspectiveControllerListener(
      this,
      this.onCloseSidePanelClose
    );
  }

  /**
   * callback function used to update the console models when the console is opened
   */
  configureConsoleOpenCloseModelUpdateEvents() {
    this.consoleController.configureModelUpdateListener(
      this,
      this.onConsoleOpenUpdateModels
    );
  }

  /**
   * callback function that is called when the console sidebar panel is closed
   */
  onCloseSidePanelClose() {
    if (!this.sidePanelController.isVisible()) {
      this.teamModel.resetActiveMemberToMe();
    }
  }

  /**
   * dynamically loads the model data when the console is open. uses the event int arg
   * 1 is shown, 0 is hiden.. see CONSOLE_WINDOW_SHOW_HIDE event. the value represents
   * the state of this window; not action
   * @param event
   * @param arg
   */
  onConsoleOpenUpdateModels(event, arg) {
    console.log(this.name + " update models -> " + JSON.stringify(arg));
    switch (arg) {
      case ConsoleView.ConsoleStates.SHOW_CONSOLE:
        console.log(this.name + " console shown -> update models ");
        this.teamModel.refreshAll();
        if (this.spiritModel.hasLinks()) {
          this.journalModel.loadDefaultJournal();
        }
        break;
      case ConsoleView.ConsoleStates.HIDE_CONSOLE:
        console.log(this.name + " console hidden : switch to me w/ delay ");
        setTimeout(() => {
          this.teamModel.resetActiveMemberToMe();
        }, ConsoleView.animationTime * 1000);
        break;
      default:
        throw new Error("Unknown console show hide argument '" + arg + "'");
    }
  }
}
