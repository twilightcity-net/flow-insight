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

  onConsoleOpenUpdateModels() {
    console.log(this.name + " - Event Fired: onConsoleOpenUpdateModels");
    if (!this.consoleController.consoleIsCollapsed) {
      if (this.spiritModel.hasLinks()) {
        this.journalModel.loadDefaultJournal();
      }
    } else {
      /// TODO this should be migrated over to a realtime team stream of events.
      /// create teamUpdateEvent

      setTimeout(() => {
        this.teamModel.resetActiveMemberToMe();
        this.teamModel.refreshAll();
      }, 400);
    }
  }
}
