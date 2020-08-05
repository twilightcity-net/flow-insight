import React, { Component } from "react";
import ActiveCircuit from "./components/ActiveCircuit";
import StartCircuit from "./components/StartCircuit";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { Icon, Message } from "semantic-ui-react";

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
      error: null
    };
    this.resourcesController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
  }

  /**
   * mounts our circuit component. This function checks to see if this is a
   * circuit with an active feed. if so we need to load and join the room.
   */
  componentDidMount() {
    if (UtilRenderer.isWTFResource(this.props.resource)) {
      this.resourcesController.joinCircuit(
        this.props.resource
      );
    }
  }

  componentWillUnmount() {
    this.resourcesController.leaveCircuit(
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
      nextState.error = null;
      this.resourcesController.leaveCircuit(
        this.props.resource
      );
      this.resourcesController.joinCircuit(
        nextProps.resource
      );
    }
    return true;
  }

  /**
   * renders our circuit error with a given string. This is usually not
   * seen and renders errors from gridtime.
   * @param error
   * @returns {*}
   */
  getCircuitError(error) {
    return (
      <div id="component" className="errorLayout">
        <Message icon negative size="large">
          <Icon name="warning sign" />
          <Message.Content>
            <Message.Header>Error :(</Message.Header>
            WTF! {error} =(^.^)=
          </Message.Content>
        </Message>
      </div>
    );
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
        <ActiveCircuit resource={this.props.resource} />
      );
    }

    if (this.state.error) {
      wtfPanel = this.getCircuitError(this.state.error);
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
