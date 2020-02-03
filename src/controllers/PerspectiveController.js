import { DataModelFactory } from "../models/DataModelFactory";
import { ActiveViewControllerFactory } from "./ActiveViewControllerFactory";
import ConsoleView from "../views/ConsoleView";

/**
 * This class is used to coordinate views across all the perspective change events
 */
export class PerspectiveController {
  /**
   * builds the perspecitve controller which control the root level of the console view. This
   * class handles state changes of the console layout and the console sidebar panel and menu
   * @param scope
   */
  constructor(scope) {
    this.name = "[PerspectiveController]";
    this.scope = scope;
  }

  /**
   * the global static reference of this class. There can only be on ~-~
   */
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

  // FIXME this should not make any remote requests.
  onConsoleOpenUpdateModels(event, arg) {
    switch (arg) {
      case ConsoleView.ConsoleStates.SHOW_CONSOLE:
        // TODO this should be moved to the console journal panel

        // FIXME this needs to be updated by loadingb the content into the browser
        // if (this.spiritModel.hasLinks()) {
        //   this.journalModel.loadDefaultJournal();
        // }
        break;
      case ConsoleView.ConsoleStates.HIDE_CONSOLE:
        setTimeout(() => {
          this.teamModel.resetActiveMemberToMe();
        }, ConsoleView.animationTime * 1000);
        break;
      default:
        throw new Error("Unknown console show hide argument '" + arg + "'");
    }
  }
}
