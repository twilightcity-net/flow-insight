import { ActiveViewController } from "./ActiveViewController";
import { CircuitClient } from "../clients/CircuitClient";
import { TerminalClient } from "../clients/TerminalClient";
import { BrowserRequestFactory } from "./BrowserRequestFactory";
import { RendererControllerFactory } from "./RendererControllerFactory";
import { RendererEventFactory } from "../events/RendererEventFactory";
import UtilRenderer from "../UtilRenderer";
import { TalkToClient } from "../clients/TalkToClient";
import FeatureToggle from "../layout/shared/FeatureToggle";

export class ResourceCircuitController extends ActiveViewController {
  /**
   * builds our resource circuit controller with a given scope
   * @param scope
   */
  constructor(scope) {
    super(scope);
    this.browserController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.LAYOUT_BROWSER,
        this
      );
    this.circuitJoinLeaveNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_JOIN_LEAVE,
        this
      );
    this.circuitJoinFailNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_JOIN_FAIL,
        this
      );
    this.circuitStateChangeFailNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_STATE_CHANGE_FAIL,
        this
      );

    this.circuitStartStopNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_START_STOP,
        this
      );
    this.circuitPauseResumeNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_PAUSE_RESUME,
        this
      );
    this.circuitSolveNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_SOLVE,
        this
      );
    this.joinExistingRoomNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_JOIN_EXISTING_ROOM,
        this
      );
    this.joinExistingRoomFailNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_JOIN_EXISTING_ROOM_FAIL,
        this
      );
    this.leaveExistingRoomNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_LEAVE_EXISTING_ROOM,
        this
      );
  }

  /**
   * a list of status types that are referenced by the Wtf Status updates.
   * @returns {{TEAM_WTF_THRESHOLD:string, TEAM_RETRO_STARTED: string, TEAM_WTF_JOINED: string, TEAM_WTF_ON_HOLD: string, TEAM_WTF_CANCELED: string, TEAM_WTF_RESUMED: string, TEAM_WTF_STARTED: string, TEAM_WTF_LEAVE: string, TEAM_WTF_SOLVED: string}}
   * @constructor
   */
  static get StatusTypes() {
    return {
      TEAM_WTF_STARTED: "TEAM_WTF_STARTED",
      TEAM_WTF_JOINED: "TEAM_WTF_JOINED",
      TEAM_WTF_LEAVE: "TEAM_WTF_LEAVE",
      TEAM_WTF_ON_HOLD: "TEAM_WTF_ON_HOLD",
      TEAM_WTF_RESUMED: "TEAM_WTF_RESUMED",
      TEAM_WTF_SOLVED: "TEAM_WTF_SOLVED",
      TEAM_WTF_CANCELED: "TEAM_WTF_CANCELED",
      TEAM_RETRO_STARTED: "TEAM_RETRO_STARTED",
      TEAM_WTF_UPDATED: "TEAM_WTF_UPDATED",
      TEAM_WTF_THRESHOLD: "TEAM_WTF_THRESHOLD",
    };
  }

  /**
   * helper function to wrap our function from our other controller
   * @param request - {BrowserRequestFactory} type request
   */
  makeSidebarBrowserRequest(request) {
    this.browserController.makeRequest(request);
  }

  /**
   * notifies the system when the member joins an active circuit. A positive
   * value is passed into the event argument to denote this.
   */
  fireJoinCircuitNotifyEvent() {
    this.circuitJoinLeaveNotifier.dispatch(1);
  }

  /**
   * notifies the system that the member left an active circuit as a
   * participant. negative argument value represents leaving.
   */
  fireLeaveCircuitNotifyEvent() {
    this.circuitJoinLeaveNotifier.dispatch(-1);
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
   * notifies the system that we should pause the active circuit by
   * dispatching 1 to the event in the buss.
   */
  fireJoinedCircuitStoppedNotifyEvent() {
    this.circuitPauseResumeNotifier.dispatch(1);
  }

  /**
   * notifies the systme that we should resume the active circuit by
   * dispatching the value -1 to the event.
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

  /**
   * notifies the system that we join an active circuit.
   */
  fireJoinExistingRoomNotifyEvent() {
    this.joinExistingRoomNotifier.dispatch(1);
  }

  /**
   * notifies the system that we failed to join a room
   */
  fireJoinExistingRoomNotifyFailEvent(error) {
    this.joinExistingRoomFailNotifier.dispatch({
      context: "Join room failed",
      error: error,
    });
  }

  /**
   * notifies the system that we failed to join a circuit
   */
  fireJoinCircuitFailNotifyEvent(error) {
    this.circuitJoinFailNotifier.dispatch({
      context: "Join circuit failed",
      error: error,
    });
  }

  /**
   * notifies the system that we failed a circuit state change
   */
  fireCircuitStateChangeFailNotifyEvent(error) {
    this.circuitStateChangeFailNotifier.dispatch({
      context: "Requested state change failed",
      error: error,
    });
  }
  /**
   * notifies the system that we join an active circuit.
   */
  fireJoinExistingRoomFailureNotifyEvent() {
    this.joinExistingRoomNotifier.dispatch(1);
  }

  /**
   * notifies our local system that we have left our current active circuit.
   */
  fireLeaveExistingRoomNotifyEvent() {
    this.leaveExistingRoomNotifier.dispatch(1);
  }

  /**
   * Start a troubleshooting session by loading the new session into the browser
   * @param callback
   */
  startCircuit(callback) {
    CircuitClient.startWtf(this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        let circuit = arg.data,
          request = BrowserRequestFactory.createRequest(
            BrowserRequestFactory.Requests.CIRCUIT,
            circuit.circuitName
          );
        this.browserController.makeRequest(request);
        this.fireCircuitStartNotifyEvent();
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * handler that is called when we want to solve a given wtf circuit.
   * @param circuitName the circuit to solve
   * @param callback
   */
  solveCircuit(circuitName, callback) {
    CircuitClient.solveWtf(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        this.returnToDefaultPage();
        this.fireCircuitSolveNotifyEvent();
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * Return to the default page after we resolve (solve or cancel) the circuit
   */
  returnToDefaultPage() {
    let request;
    if (FeatureToggle.isJournalEnabled()) {
      request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.JOURNAL,
        BrowserRequestFactory.Locations.ME
      );
    } else {
      request = BrowserRequestFactory.createRequest(
        BrowserRequestFactory.Requests.COMMAND,
        BrowserRequestFactory.Commands.WTF
      );
    }

    this.browserController.makeRequest(request);
  }

  /**
   * handler that is called when we want to start the retro for a given circuit.
   * @param circuitName
   * @param callback
   */
  startRetro(circuitName, callback) {
    CircuitClient.startRetro(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        console.log("started retro");
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * handler that is called when we want to close a given retro, (doesnt close the active wtf)
   * @param circuitName
   * @param callback
   */
  closeRetro(circuitName, callback) {
    CircuitClient.closeWtf(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        console.log("close retro");
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * handler that is called when we put a circuit on hold
   * @param circuitName the circuit to pause
   * @param callback
   */
  pauseCircuit(circuitName, callback) {
    CircuitClient.pauseWTFWithDoItLater(
      circuitName,
      this,
      (arg) => {
        if (arg.error) {
          this.fireCircuitStateChangeFailNotifyEvent(
            arg.error
          );
        } else {
          this.fireCircuitPauseNotifyEvent();
        }
        if (callback) {
          callback(arg);
        }
      }
    );
  }

  /**
   * resumes a given circuit from on_hold status.
   * @param circuitName
   * @param callback
   */
  resumeCircuit(circuitName, callback) {
    CircuitClient.resumeWtf(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        this.fireCircuitResumeNotifyEvent();
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * handler that os called when we cancel a circuit and do not hold it
   * @param circuitName - the circuit to cancel
   * @param callback
   */
  cancelCircuit(circuitName, callback) {
    CircuitClient.cancelWtf(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireCircuitStateChangeFailNotifyEvent(
          arg.error
        );
      } else {
        this.returnToDefaultPage();
        this.fireCircuitStopNotifyEvent();
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * joins the active circuit which makes the member a participant of the
   * circuit. Gridtime will send a talk message for circuit member joined.
   * this updates the necessary database collections and emits the
   * associated events
   * @param circuitName
   */
  joinCircuit(circuitName, callback) {
    CircuitClient.joinWtf(circuitName, this, (arg) => {
      if (arg.error) {
        this.fireJoinCircuitFailNotifyEvent(arg.error);
      } else {
        console.log(
          this.name + " JOIN WTF -> " + circuitName
        );
        this.fireJoinCircuitNotifyEvent();
      }
      if (callback) {
        callback(arg);
      }
    });
  }

  /**
   * leaves the active circuit and notifies gridtime and the local system.
   * Various talk messages will be emiited from gridtime which will update
   * the necessary database collections. These events will also notify gui
   * subsystems.
   * @param circuitName
   */
  leaveCircuit(circuitName) {
    CircuitClient.leaveWtf(circuitName, this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
      }
      console.log(
        this.name + " LEAVE WTF -> " + circuitName
      );
      this.fireLeaveCircuitNotifyEvent();
    });
  }

  /**
   * leaves the specified terminal circuit
   * If the owner of the circuit, this will close the circuit
   * @param circuitName
   */
  leaveTerminalCircuit(circuitName) {
    TerminalClient.leaveCircuit(
      circuitName,
      this,
      (arg) => {
        if (arg.error) {
          console.error(arg.error);
        }
        console.log(
          this.name +
            " LEAVE TERMINAL CIRCUIT -> " +
            circuitName
        );
      }
    );
  }

  /**
   * joins us to the circuit's room on the talk network via gridtime. The
   * roomName or id is passed in as an argument
   * @param roomId
   */
  joinExistingRoomWithRoomId(roomId) {
    TalkToClient.joinExistingRoom(roomId, this, (arg) => {
      if (arg.error) {
        this.fireJoinExistingRoomNotifyFailEvent(arg.error);
      } else {
        console.log(
          this.name +
            " JOIN EXISTING ROOM -> " +
            JSON.stringify(arg)
        );
        this.fireJoinExistingRoomNotifyEvent();
      }
    });
  }

  /**
   * joins us to the circuit's room on the talk network via gridtime. The
   * roomName is parsed from the uri and "-wtf" is appended to it. This
   * roomName is then sent to gridtime over an http dto request.
   * @param resource
   */
  joinExistingRoom(resource) {
    let roomName =
      UtilRenderer.getRoomNameFromResource(resource);

    if (roomName) {
      TalkToClient.joinExistingRoom(
        roomName,
        this,
        (arg) => {
          if (arg.error) {
            this.fireJoinExistingRoomNotifyFailEvent(
              arg.error
            );
          } else {
            console.log(
              this.name +
                " JOIN EXISTING ROOM -> " +
                JSON.stringify(arg)
            );
            this.fireJoinExistingRoomNotifyEvent();
          }
        }
      );
    }
  }

  /**
   * joins us to the circuit's room on the talk network via gridtime. The
   * roomName is parsed from the uri and "-wtf" is appended to it. This
   * roomName is then sent to gridtime over an http dto request.
   * @param resource
   */
  joinExistingRetroRoom(resource) {
    let roomName =
      UtilRenderer.getRetroRoomNameFromResource(resource);

    if (roomName) {
      TalkToClient.joinExistingRoom(
        roomName,
        this,
        (arg) => {
          if (arg.error) {
            this.fireJoinExistingRoomNotifyFailEvent(
              arg.error
            );
          } else {
            console.log(
              this.name +
                " JOIN EXISTING ROOM -> " +
                JSON.stringify(arg)
            );
            this.fireJoinExistingRoomNotifyEvent();
          }
        }
      );
    }
  }

  /**
   * leaves a circuit on gridtime. This will implicitly call leave room on gridtime
   * which calls leave on that clients socket on the talknet server. No error is
   * thrown if we try to leave a room in which we dont belong or we not added to.
   * @param resource
   */
  leaveExistingRoomWithRoomId(roomId) {
    TalkToClient.leaveExistingRoom(roomId, this, (arg) => {
      if (arg.error) {
        console.error(arg.error);
      }
      this.fireLeaveExistingRoomNotifyEvent();
    });
  }

  /**
   * leaves a circuit on gridtime. This will implicitly call leave room on gridtime
   * which calls leave on that clients socket on the talknet server. No error is
   * thrown if we try to leave a room in which we dont belong or we not added to.
   * @param resource
   */
  leaveExistingRoom(resource) {
    let roomName =
      UtilRenderer.getRoomNameFromResource(resource);

    if (roomName) {
      TalkToClient.leaveExistingRoom(
        roomName,
        this,
        (arg) => {
          if (arg.error) {
            console.error(arg.error);
          }
          this.fireLeaveExistingRoomNotifyEvent();
        }
      );
    }
  }

  /**
   * leaves a circuit on gridtime. This will implicitly call leave room on gridtime
   * which calls leave on that clients socket on the talknet server. No error is
   * thrown if we try to leave a room in which we dont belong or we not added to.
   * @param resource
   */
  leaveExistingRetroRoom(resource) {
    let roomName =
      UtilRenderer.getRetroRoomNameFromResource(resource);

    if (roomName) {
      TalkToClient.leaveExistingRoom(
        roomName,
        this,
        (arg) => {
          if (arg.error) {
            console.error(arg.error);
          }
          this.fireLeaveExistingRoomNotifyEvent();
        }
      );
    }
  }
}
