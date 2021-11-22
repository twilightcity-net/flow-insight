import React, { Component } from "react";
import ActiveRetro from "./components/ActiveRetro";
import { RendererControllerFactory } from "../../../../controllers/RendererControllerFactory";
import UtilRenderer from "../../../../UtilRenderer";
import { Icon, Message } from "semantic-ui-react";
import { BaseClient } from "../../../../clients/BaseClient";
import { RendererEventFactory } from "../../../../events/RendererEventFactory";
import { ResourceCircuitController } from "../../../../controllers/ResourceCircuitController";

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
    this.state = {
      error: null,
    };
    this.resourcesController =
      RendererControllerFactory.getViewController(
        RendererControllerFactory.Views.RESOURCES,
        this
      );
    this.talkRoomMessageListener =
      RendererEventFactory.createEvent(
        RendererEventFactory.Events.TALK_MESSAGE_ROOM,
        this,
        this.onTalkRoomMessage
      );
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
    switch (arg.messageType) {
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        let data = arg.data,
          circuit = data[ActiveRetro.learningCircuitDtoStr];

        if (
          data.statusType ===
          ResourceCircuitController.StatusTypes
            .TEAM_RETRO_STARTED
        ) {
          this.handleWtfStatusUpdateMessage(circuit);
        }

        break;
      default:
        break;
    }
  };

  /**
   * processes our wtf status events. inside this function we check to see
   * if this is the circuit we are looking for.
   * If we are transitioning the state from solved to retro,
   * then we need to connect to the retro room.
   * @param arg
   */
  handleWtfStatusUpdateMessage(circuit) {
    let circuitName = this.props.resource.uriArr[1];

    if (circuit && circuitName === circuit.circuitName) {
      if (UtilRenderer.isCircuitInRetro(circuit)) {
        this.resourcesController.joinExistingRetroRoom(
          this.props.resource
        );
      } else {
        this.resourcesController.leaveExistingRetroRoom(
          this.props.resource
        );
      }
    }
  }

  /**
   * mounts our circuit component. This function checks to see if this is a
   * circuit with an active feed. if so we need to load and join the room.
   */
  componentDidMount() {
    if (UtilRenderer.isRetroResource(this.props.resource)) {
      this.resourcesController.joinExistingRetroRoom(
        this.props.resource
      );
    }
  }

  /**
   * when the component is unmounted besure to leave the existing talk room,
   * becuase we do not need to keep reciecing talk chat message details from
   * other users that are still in the circuit chat room.
   */
  componentWillUnmount() {
    this.resourcesController.leaveExistingRetroRoom(
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
      UtilRenderer.isRetroResource(nextProps.resource)
    ) {
      console.log(
        "joining a new circuit, leave and rejoin rooms"
      );
      nextState.error = null;
      this.resourcesController.leaveExistingRetroRoom(
        this.props.resource
      );
      this.resourcesController.joinExistingRetroRoom(
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
      <ActiveRetro resource={this.props.resource} />
    );

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
