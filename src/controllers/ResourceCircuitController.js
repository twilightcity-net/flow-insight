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
    this.circuitPauseUnpauseNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_PAUSE_UNPAUSE,
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
   * notifies the system know we are starting a wtf session. This is
   * paired with circuit stop notifier. Dispatch 1 to start. These
   * are hooked to the current active circuit in memory
   */
  fireCircuitStartNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(1);
  }

  /**
   * notifies the system that we are stopping the wtf session. this
   * is paired with circuit start notifier. pass -1 to stop. This is
   * associated to the current active circuit in memory
   */
  fireCircuitStopNotifyEvent() {
    this.circuitStartStopNotifier.dispatch(-1);
  }

  /**
   * notifies the system that we should pause the active circuit by
   * dispatching 1 to the event in the buss.
   */
  fireCircuitPauseNotifyEvent() {
    this.circuitPauseUnpauseNotifier.dispatch(1);
  }

  /**
   * notifies the systme that we should resume the active circuit by dispatching
   * the value -1 to the event.
   */
  fireCircuitUnpauseNotifyEvent() {
    this.circuitPauseUnpauseNotifier.dispatch(-1);
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
    CircuitClient.pauseWTFWithDoItLater(
      circuitName,
      this,
      arg => {
        let request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.JOURNAL,
          BrowserRequestFactory.Locations.ME
        );
        this.browserController.makeRequest(request);
        this.fireCircuitPauseNotifyEvent();
      }
    );
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
