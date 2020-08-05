import { ActiveViewController } from "./ActiveViewController";
import { CircuitClient } from "../clients/CircuitClient";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";
import { TalkToClient } from "../clients/TalkToClient";

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
    this.circuitPauseResumeNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_PAUSE_RESUME,
      this
    );
    this.circuitSolveNotifier = RendererEventFactory.createEvent(
      RendererEventFactory.Events
        .VIEW_CONSOLE_CIRCUIT_SOLVE,
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
    this.circuitPauseResumeNotifier.dispatch(1);
  }

  /**
   * notifies the systme that we should resume the active circuit by dispatching
   * the value -1 to the event.
   */
  fireCircuitResumeNotifyEvent() {
    this.circuitPauseResumeNotifier.dispatch(-1);
  }

  /**
   * notifies the system that we should solve the active circuit by
   * dispatching 1 to the event in the buss.
   */
  fireCircuitSolveNotifyEvent() {
    this.circuitSolveNotifier.dispatch(1);
  }

  fireCircuitJoinNotifyEvent() {
    this.circuitJoinStopNotifier.dispatch(1);
  }

  fireCircuitLeaveNotifyEvent() {
    this.circuitLeaveStopNotifier.dispatch(-1);
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   */
  startCircuit() {
    CircuitClient.startWtf(this, arg => {
      let circuit = arg.data,
        request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
          circuit.circuitName
        );
      this.browserController.makeRequest(request);
      this.fireCircuitStartNotifyEvent();
    });
  }

  /**
   * handler that is called when we want to solve a given wtf circuit.
   * @param circuitName - the circuit to pause
   */
  solveCircuit(circuitName) {
    CircuitClient.solveWtf(circuitName, this, arg => {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.JOURNAL,
        BrowserRequestFactory.Locations.ME
      );
      this.browserController.makeRequest(request);
      this.fireCircuitSolveNotifyEvent();
    });
  }

  /**
   * handler that is called when we put a circuit on hold
   * @param circuitName - the circuit to pause
   */
  pauseCircuit(circuitName) {
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
  }

  /**
   * resumes a given circuit from on_hold status.
   * @param circuitName
   */
  resumeCircuit(circuitName) {
    CircuitClient.resumeWtf(circuitName, this, arg => {
      this.fireCircuitResumeNotifyEvent();
    });
  }

  /**
   * handler that os called when we cancel a circuit and do not hold it
   * @param circuitName - the circuit to cancel
   */
  cancelCircuit(circuitName) {
    CircuitClient.cancelWtf(circuitName, this, arg => {
      let request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.JOURNAL,
        BrowserRequestFactory.Locations.ME
      );
      this.browserController.makeRequest(request);
      this.fireCircuitStopNotifyEvent();
    });
  }

  /**
   * joins us to the circuit's room on the talk network via gridtime. The roomname is
   * parsed from the uri and "-wtf" is appended to it. This roomName is then sent to
   * gridtime over an http dto request.
   */
  joinCircuit(resource) {
    let roomName = UtilRenderer.getRoomNameFromResource(
      resource
    );

    if (roomName) {
      TalkToClient.joinExistingRoom(roomName, this, arg => {
        let request = BrowserRequestFactory.createRequest(
          BrowserRequestFactory.Requests.JOURNAL,
          BrowserRequestFactory.Locations.ME
        );
        this.browserController.makeRequest(request);
        this.fireCircuitJoinNotifyEvent();
      });
    }
  }

  /**
   * leaves a circuit on gridtime. This will implicitly call leave room on gridtime
   * which calls leave on that clients socket on the talk server. No error is
   * thrown if we try to leave a room in which we dont belong or we not added to.
   * @param resource
   */
  leaveCircuit(resource) {
    let roomName = UtilRenderer.getRoomNameFromResource(
      resource
    );

    if (roomName) {
      TalkToClient.leaveExistingRoom(
        roomName,
        this,
        arg => {
          let request = BrowserRequestFactory.createRequest(
            BrowserRequestFactory.Requests.JOURNAL,
            BrowserRequestFactory.Locations.ME
          );
          this.browserController.makeRequest(request);
          this.fireCircuitLeaveNotifyEvent();
        }
      );
    }
  }
}
