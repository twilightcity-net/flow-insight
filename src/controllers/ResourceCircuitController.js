import { ActiveViewController } from "./ActiveViewController";
import { CircuitClient } from "../clients/CircuitClient";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { RendererEventFactory } from "../events/RendererEventFactory";

export class ResourceCircuitController extends ActiveViewController {
  /**
   * builds our resource circuit controller with a given scope
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.browserController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.LAYOUT_BROWSER,
      this
    );
    this.circuitStartStopNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events.VIEW_CONSOLE_CIRCUIT_START_STOP,
      this
    );
  }

  fireCircuitStartNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(1);
  }

  fireCircuitStopNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(-1);
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   */
  newCircuit = () => {
    console.log(this.name + " start troubleshooting");

    // TODO show some type of loading view here
    // CircuitClient.createLearningCircuitModel("angry_teachers", this, model => {
    //   let request = BrowserRequestFactory.createRequest(
    //     BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
    //     model.circuitName
    //   );
    //   this.browserController.makeRequest(request);
    //   this.fireCircuitStartNotifyEvent();
    // });
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
