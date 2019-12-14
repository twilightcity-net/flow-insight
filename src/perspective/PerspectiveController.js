import { DataModelFactory } from "../models/DataModelFactory";
import { ActiveViewControllerFactory } from "../perspective/ActiveViewControllerFactory";

/**
 * This class is used to coordinate views across all the perspective change events
 */
export class PerspectiveController {
  constructor(scope) {
    this.name = "[PerspectiveController]";
    this.scope = scope;
  }

  static instance;

  static init(scope) {
    if (!PerspectiveController.instance) {
      PerspectiveController.instance = new PerspectiveController(scope);
      PerspectiveController.instance.wireViewControllersTogether();
    }
  }

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

  configureSidePanelCloseEvent() {
    this.sidePanelController.configurePerspectiveControllerListener(
      this,
      this.onCloseSidePanelResetMemberSelection
    );
  }

  configureConsoleOpenCloseModelUpdateEvents() {
    this.consoleController.configureModelUpdateListener(
      this,
      this.onConsoleOpenUpdateModels
    );
  }

  onCloseSidePanelResetMemberSelection() {
    console.log(
      this.name + " - Event Fired: onCloseSidePanelResetMemberSelection"
    );
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
    console.log(
      this.name +
        " - Event Fired: onConsoleOpenUpdateModels -> " +
        event +
        " : " +
        arg.toString()
    );

    if (arg === 1) {
      //shown
      if (this.spiritModel.hasLinks()) {
        this.journalModel.loadDefaultJournal();
      }
    } else {
      /// TODO create an event console shown which will call this

      // this is required so that the console sliding animation isn't wonky or laggy
      // maybe create a console is shown (done animating) event to fire these..
      // this would also throttle requests if thw console is opened and closed rapidly
      setTimeout(() => {
        this.teamModel.resetActiveMemberToMe();
        this.teamModel.refreshAll();
      }, 400);
    }
  }
}
