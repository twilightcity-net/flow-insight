import React, { Component } from "react";
import ActiveCircuit from "./components/ActiveCircuit";
import StartCircuit from "./components/StartCircuit";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import { BrowserRequestFactory } from "../../../../controllers/BrowserRequestFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { TalkToClient } from "../../../../clients/TalkToClient";
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
    this.myController = RendererControllerFactory.getViewController(
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
      this.joinCircuit(this.props.resource);
    }
  }

  componentWillUnmount() {
    this.leaveCircuit(this.props.resource);
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
      this.leaveCircuit(this.props.resource);
      this.joinCircuit(nextProps.resource);
    }
    return true;
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
        if (arg.error) {
          this.setState({
            error: arg.error
          });
        } else {
          console.log(
            this.name +
              " JOIN ROOM -> " +
              JSON.stringify(arg)
          );
        }
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
          if (arg.error) {
            this.setState({
              error: arg.error
            });
          } else {
            console.log(
              this.name +
                " LEAVE ROOM -> " +
                JSON.stringify(arg)
            );
          }
        }
      );
    }
  }

  /**
   * creates a new request and dispatch this to the browser request listener
   * @param circuitName
   */
  requestBrowserToLoadActiveCircuit(circuitName) {
    let request = BrowserRequestFactory.createRequest(
      BrowserRequestFactory.Requests.ACTIVE_CIRCUIT,
      circuitName
    );
    this.myController.makeSidebarBrowserRequest(request);
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
