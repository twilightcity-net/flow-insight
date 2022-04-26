import React, { Component } from "react";
import ActiveCircuit from "./components/ActiveCircuit";
import StartCircuit from "./components/StartCircuit";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for the console cntent
 * @author ZoeDreams
 */
export default class CircuitResource extends Component {
  /**
   * builds our resource with the given properties
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[CircuitResource]";
    this.state = {
      error: null,
    };
    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );

    this.circuitJoinCircuitFailListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_JOIN_FAIL,
        this,
        this.handleError
      );

    this.circuitJoinRoomFailListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_JOIN_EXISTING_ROOM_FAIL,
        this,
        this.handleError
      );

    this.circuitStateChangeFailListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events
          .VIEW_CONSOLE_CIRCUIT_STATE_CHANGE_FAIL,
        this,
        this.handleError
      );
  }

  /**
   * mounts our circuit component. This function checks to see if this is a
   * circuit with an active feed. if so we need to load and join the room.
   */
  componentDidMount() {
    if (UtilRenderer.isWTFResource(this.props.resource)) {
      this.resourcesController.joinExistingRoom(
        this.props.resource
      );
    }
  }

  handleError(event, arg) {
    console.error(arg.error);
    this.setState({
      errorContext: arg.context,
      error: arg.error,
    });
  }

  handleDisplayError(errorContext, error) {
    console.error(error);
    this.setState({
      errorContext: errorContext,
      error: error,
    });
  }

  /**
   * when the component is unmounted besure to leave the existing talk room,
   * becuase we do not need to keep reciecing talk chat message details from
   * other users that are still in the circuit chat room.
   */
  componentWillUnmount() {
    this.resourcesController.leaveExistingRoom(
      this.props.resource
    );
  }

  /**
   * this function is similiar to the mount function. This function will first
   * check to see if we are just reloading the same page or loading a new
   * circuit. If it is a new circuit and a wtf. the function will join
   * the user to that room on talk.
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      this.props.resource.uri !== nextProps.resource.uri &&
      UtilRenderer.isWTFResource(nextProps.resource)
    ) {
      console.log(
        "joining a new circuit, leave and rejoin rooms"
      );
      nextState.error = null;
      this.resourcesController.leaveExistingRoom(
        this.props.resource
      );
      this.resourcesController.joinExistingRoom(
        nextProps.resource
      );
    }
    return true;
  }

  /**
   * renders the journal layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    let wtfPanel = (
      <StartCircuit resource={this.props.resource} />
    );

    if (UtilRenderer.isWTFResource(this.props.resource)) {
      wtfPanel = (
        <ActiveCircuit
          resource={this.props.resource}
          handleError={this.handleDisplayError}
        />
      );
    }

    if (this.state.error) {
      wtfPanel = UtilRenderer.getErrorPage(
        this.state.errorContext,
        this.state.error
      );
    }

    return (
      <div id="component" className="circuitLayout">
        <div id="wrapper" className="circuitContent">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
