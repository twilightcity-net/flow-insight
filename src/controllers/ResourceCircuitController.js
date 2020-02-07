import { ActiveViewController } from "./ActiveViewController";
import { DataModelFactory } from "../models/DataModelFactory";
import { CircuitClient } from "../clients/CircuitClient";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { ActiveViewControllerFactory } from "./ActiveViewControllerFactory";

export class ResourceCircuitController extends ActiveViewController {
  constructor(scope) {
    super(scope);
    this.browserController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.BROWSER_PANEL,
      this
    );
  }

  wireTogetherModels(scope) {
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      scope
    );
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   */
  startTroubleshooting = () => {
    console.log(this.name + " start troubleshooting");
    CircuitClient.createLearningCircuitModel("angry_teachers", this, model => {
      console.log(model);
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
        model.circuitName
      );
      this.browserController.makeRequest(request);
    });
  };

  retroActiveCircuitResource = () => {
    console.log(this.name + " this active circuit - retro");
  };

  holdActiveCircuitResource = () => {
    console.log(this.name + " this active circuit -> hold");

  };

  cancelActiveCircuitResource = () => {
    console.log(this.name + " this active circuit - cancel");
  };
}
