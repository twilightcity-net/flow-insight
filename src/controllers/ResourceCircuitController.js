import { ActiveViewController } from "./ActiveViewController";
import { DataModelFactory } from "../models/DataModelFactory";
import { CircuitClient } from "../clients/CircuitClient";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { ActiveViewControllerFactory } from "./ActiveViewControllerFactory";

export class ResourceCircuitController extends ActiveViewController {
  /**
   * builds our resource circuit controller with a given scope
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.browserController = ActiveViewControllerFactory.getViewController(
      ActiveViewControllerFactory.Views.BROWSER_PANEL,
      this
    );
  }

  /**
   * connects the models to our scope
   * @param scope
   */
  wireTogetherModels(scope) {
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      scope
    );
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   */
  newCircuit = () => {
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

  /**
   * handler for when we want to start a retro
   */
  retroActiveCircuitResource = () => {
    console.log(this.name + " this active circuit - retro");
  };

  /**
   * handler that is called when we put a circuit on hold
   */
  holdActiveCircuitResource = () => {
    console.log(this.name + " this active circuit -> hold");
  };

  /**
   * handler that os callled when we cancel a circuit and do not hold it
   */
  cancelActiveCircuitResource = () => {
    console.log(this.name + " this active circuit - cancel");
  };
}
