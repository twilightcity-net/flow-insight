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
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_START_STOP,
      this
    );
  }

  /**
   * helper function to wrap our function from our other controller
   * @param request - {BrowserRequestFactory} type request
   */
  makeSidebarBrowserRequest(request) {
    this.browserController.makeRequest(request);
  }

  /**
   * notifies the system know we are starting a wtf session
   */
  fireCircuitStartNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(1);
  }

  /**
   * notifies the system that we are stopping the wtf session
   */
  fireCircuitStopNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(-1);
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   */
  startCircuit = () => {
    CircuitClient.startWtf(this, arg => {
      let circuit = arg.data,
        request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
          circuit.circuitName
        );
      this.browserController.makeRequest(request);
      this.fireCircuitStartNotifyEvent();
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
   * @param circuitName - the circuit to pause
   */
  pauseCircuit = circuitName => {
    CircuitClient.pauseWtf(circuitName);
  };

  /**
   * handler that os called when we cancel a circuit and do not hold it
   * @param circuitName - the circuit to cancel
   */
  cancelCircuit = circuitName => {
    CircuitClient.cancelWtf(circuitName, this, arg => {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.JOURNAL,
        BrowserRequestFactory.Locations.ME
      );
      this.browserController.makeRequest(request);
      this.fireCircuitStopNotifyEvent();
    });
  };
}
