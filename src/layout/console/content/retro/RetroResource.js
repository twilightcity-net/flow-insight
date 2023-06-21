import React, { Component } from "react";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { BaseClient } from "../../../../clients/BaseClient";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";
import { ResourceCircuitController } from "../../../../controllers/ResourceCircuitController";
import { CircuitClient } from "../../../../clients/CircuitClient";
import ActiveRetro from "./components/ActiveRetro";

/**
 * this component is the top level resource for a circuit retro
 */
export default class RetroResource extends Component {
  /**
   * builds our resource with the given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[RetroResource]";
    this.circuit = null;

    this.state = {
      error: null,
      circuit: null,
    };
    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );
  }


  /**
   * mounts our circuit component and supporting top level data.
   * If there's an active retro feed going, this also joins us to the live retro room.
   */
  componentDidMount() {
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );

    this.circuitsRefreshListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.CIRCUIT_DATA_REFRESH,
        this,
        this.onCircuitDataRefresh
      );

    this.circuitJoinRoomFailListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_JOIN_EXISTING_ROOM_FAIL,
        this,
        this.handleJoinError
      );

    this.retroLoadNotifier =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.VIEW_CONSOLE_RETRO_LOAD,
        this
      );


    let circuitName = this.props.resource.uriArr[1];
    this.loadTopLevelCircuit(circuitName);
  }

  /**
   * when the component is unmounted be sure to leave the existing talk room,
   * because we don't want to keep receiving talk messages after we've left
   * from other users that are still in the circuit chat room.
   */
  componentWillUnmount() {
    if (
      this.state.circuit &&
      this.state.circuit.retroTalkRoomId
    ) {
      this.resourcesController.leaveExistingRoomWithRoomId(
        this.state.circuit.retroTalkRoomId
      );
    }

    this.talkRoomMessageListener.clear();
    this.circuitsRefreshListener.clear();
    this.circuitJoinRoomFailListener.clear();
    this.retroLoadNotifier.clear();
  }
  /**
   * Updates the state of the circuit, based on a state change, or the resource uri
   * changing entirely
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.resource.uri !== prevProps.resource.uri) {
      if (
        prevState.circuit &&
        prevState.circuit.retroTalkRoomId
      ) {
        this.resourcesController.leaveExistingRoomWithRoomId(
          prevState.circuit.retroTalkRoomId
        );
      }

      if (prevState.error) {
        this.setState({ error: null });
      }

      let circuitName = this.props.resource.uriArr[1];
      this.loadTopLevelCircuit(circuitName);
    }
  }


  /**
   * Force refresh the circuit data manually on triggering event.  This is called after the connection
   * goes stale, and reconnects again.  Since we lost messages, easiest way to resync is to refresh again
   */
  onCircuitDataRefresh() {
    let circuitName = this.props.resource.uriArr[1];

    this.loadTopLevelCircuit(circuitName);
  }

  /**
   * event handler for talk messages. This is called everytime we receive a new talk
   * message over the event bus. Make sure to check that this is the circuit
   * we wish to effect, as you can get various wtf status events for other
   * types of circuits going on in the network.
   * @param event
   * @param arg
   */
  onTalkRoomMessage = (event, arg) => {
    let circuitName = this.props.resource.uriArr[1];
    let data = arg.data,
      circuit = data[ActiveRetro.learningCircuitDtoStr];

    switch (arg.messageType) {
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        if (
          circuit &&
          circuitName === circuit.circuitName
        ) {
          if (
            data.statusType === ResourceCircuitController.StatusTypes.TEAM_RETRO_STARTED
          ) {
            this.handleRetroStartedMessage(circuit);
          }

          this.setState({
            circuit: circuit,
          });
        }

        break;
      default:
        break;
    }
  };

  /**
   * processes our retro started event, and joins the created retro room
   * @param arg
   */
  handleRetroStartedMessage(circuit) {
    if (UtilRenderer.isCircuitInRetro(circuit)) {
      this.resourcesController.joinExistingRoomWithRoomId(
        circuit.retroTalkRoomId
      );
    }
  }

  /**
   * Loads the data for the top level circuit objects and saves into the state.
   * These get passed down as properties to the rendering views.
   * @param circuitName
   */
  loadTopLevelCircuit(circuitName) {
    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      (arg) => {
        if (arg.error) {
          this.handleError(
            "Failed to load circuit",
            arg.error
          );
        } else {
          this.circuit = arg.data;
          this.setState({
            circuit: this.circuit,
          });
          this.retroLoadNotifier.dispatch({circuitName: circuitName});

          if (this.circuit.retroTalkRoomId) {
            this.resourcesController.joinExistingRoomWithRoomId(
              this.circuit.retroTalkRoomId
            );
          }
        }
      }
    );
  }

  handleError(errorContext, error) {
    this.setState({
      errorContext: errorContext,
      error: error,
    });
  }

  handleJoinError(event, arg) {
    console.error(arg.error);
    this.setState({
      errorContext: arg.context,
      error: arg.error,
    });
  }



  /**
   * renders the retro layout
   * @returns {*} - the JSX to render
   */
  render() {
    let panel = "";

    if (this.state.circuit) {
      console.log("has circuit (retro resource)");
      panel = (
        <ActiveRetro
          circuit={this.state.circuit}
          handleError={this.handleError}
        />
      );
    }

    if (this.state.error) {
      panel = UtilRenderer.getErrorPage(
        this.state.errorContext,
        this.state.error
      );
    }

    return (
      <div id="component" className="circuitLayout">
        <div id="wrapper" className="circuitContent">
          {panel}
        </div>
      </div>
    );
  }
}
