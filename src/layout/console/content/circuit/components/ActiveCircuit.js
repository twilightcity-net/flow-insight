import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import CircuitSidebar from "./CircuitSidebar";
import ActiveCircuitFeed from "./ActiveCircuitFeed";
import ActiveCircuitScrapbook from "./ActiveCircuitScrapbook";
import { Transition } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { CircuitClient } from "../../../../../clients/CircuitClient";
import { MemberClient } from "../../../../../clients/MemberClient";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { BaseClient } from "../../../../../clients/BaseClient";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveCircuit extends Component {
  /**
   * the string name of our learning circuit dto used for property name.
   * @type {string}
   */
  static learningCircuitDtoStr = "learningCircuitDto";

  /**
   * the string that represents  the roomMember prop of some talk message data.
   * @type {string}
   */
  static roomMemberPropStr = "roomMember";

  /**
   *  builds the active circuit component
   * @param props
   */
  constructor(props) {
    super(props);
    this.name = "[ActiveCircuit]";
    this.animationType = "fade";
    this.animationDelay = 210;
    this.me = MemberClient.me;
    this.myController = RendererControllerFactory.getViewController(
      RendererControllerFactory.Views.RESOURCES,
      this
    );
    this.talkRoomMessageListener = RendererEventFactory.createEvent(
      RendererEventFactory.Events.TALK_MESSAGE_ROOM,
      this,
      this.onTalkRoomMessage
    );
    this.circuitSidebarComponent = null;
    this.circuitFeedComponent = null;
    this.state = {
      resource: props.resource,
      scrapbookVisible: false,
      model: null,
      messages: [],
      status: [],
      circuitMembers: []
    };
  }

  /**
   * called after this circuit component is loaded. This will then fetch the circuit
   * details from our local database and update our model in our state for our
   * child components
   */
  componentDidMount() {
    let circuitName = this.props.resource.uriArr[1];
    this.loadCircuit(circuitName, null, []);
  }

  /**
   * checks our update argument to see if we should update and get circuit
   * model from database
   * @param nextProps
   * @param nextState
   * @param nextContext
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (
      !this.state.model ||
      this.state.scrapbookVisible !==
        nextState.scrapbookVisible
    ) {
      return true;
    } else if (
      this.props.resource.uri === nextProps.resource.uri
    ) {
      return false;
    }

    let circuitName = nextProps.resource.uriArr[1];
    this.loadCircuit(circuitName, null, []);
    this.setState({
      model: null,
      messages: [],
      circuitMembers: []
    });

    return false;
  }

  /**
   * updates and loads our circuit form gridtime
   * @param circuitName
   * @param model
   * @param messages
   */
  loadCircuit(circuitName, model, messages) {
    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      arg => {
        model = arg.data;
        this.updateStateModels(model);
        TalkToClient.getAllTalkMessagesFromRoom(
          model.wtfTalkRoomName,
          model.wtfTalkRoomId,
          this,
          arg => {
            this.updateStateMessages(arg.data);
          }
        );
        CircuitClient.loadCircuitMembers(
          circuitName,
          model.wtfTalkRoomId,
          this,
          arg => {
            this.updateStateCircuitMembers(arg.data);
          }
        );
      }
    );
  }

  /**
   * this is called when we unmount the component so that we can clear any active listeners
   * for memory management.
   */
  componentWillUnmount() {
    this.talkRoomMessageListener.clear();
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
      case BaseClient.MessageTypes
        .CIRCUIT_MEMBER_STATUS_EVENT:
        return this.handleCircuitMemberStatusEventMessage(
          arg
        );
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        return this.handleWtfStatusUpdateMessage(arg);
      default:
        return;
    }
  };

  /**
   * processes our circuit member status event which is used to notify the
   * current active circuit that another member has joined this active
   * circuit that we are part of. This includes ourself. This function
   * should update the circuit members state model that is linked to the
   * child components of this resource view.
   * @param arg
   */
  handleCircuitMemberStatusEventMessage(arg) {
    let data = arg.data,
      roomMember = data[ActiveCircuit.roomMemberPropStr];

    switch (data.statusEvent) {
      case BaseClient.StatusEvents.CIRCUIT_MEMBER_JOINED:
        this.addCircuitMemberToCircuit(roomMember);
        return;
      case BaseClient.StatusEvents.CIRCUIT_MEMBER_LEAVE:
        this.removeCircuitMemberFromCircuit(roomMember);
        return;
      default:
        return;
    }
  }

  /**
   * adds a circuit member object to our array of circuit members. the
   * function then will update the states of the child components
   * @param roomMember
   */
  addCircuitMemberToCircuit(roomMember) {
    let circuitMembers = this.state.circuitMembers,
      circuitMember = null,
      len = circuitMembers.length,
      members = [roomMember];

    for (let i = 0; i < len; i++) {
      circuitMember = circuitMembers[i];
      if (circuitMember.memberId !== roomMember.memberId) {
        members.push(circuitMember);
      }
    }
    this.updateStateCircuitMembers(members);
  }

  /**
   * removes a given circuit member from the array by search by member id.
   * This then will update the child component states.
   * @param roomMember
   */
  removeCircuitMemberFromCircuit(roomMember) {
    let circuitMembers = this.state.circuitMembers,
      circuitMember = null,
      len = circuitMembers.length,
      members = [];

    for (let i = 0; i < len; i++) {
      circuitMember = circuitMembers[i];
      if (circuitMember.memberId !== roomMember.memberId) {
        members.push(circuitMember);
      }
    }
    this.updateStateCircuitMembers(members);
  }

  /**
   * processes our wtf status events. inside this function we check to see
   * if this is the circuit we are looking for. some jedi shit. then we use
   * the classic Object.assign to mutate into a new prototype. Lastly we
   * call an update on the linked state models which represent our active
   * circuit that we are participating in. This event is is broadcast over
   * the team circuit.
   * @param arg
   */
  handleWtfStatusUpdateMessage(arg) {

    let data = arg.data,
      circuit = data[ActiveCircuit.learningCircuitDtoStr],
      model = this.state.model;

    if (
      data &&
      circuit &&
      model &&
      circuit.id === model.id
    ) {
        //currently the only updatable property via status update message
        this.circuitSidebarComponent.setDescription(circuit.description);
    }
  }

  /**
   * updates our models in our various child components states. This
   * utilizes callback functions which are way faster then using refs
   * @param model
   */
  updateStateModels(model) {
    this.setState({
      model: model
    });
    this.circuitSidebarComponent.setState({
      model: model
    });
    this.circuitFeedComponent.setState({
      model: model
    });
  }

  /**
   * updates our components states with our updated array of chat messages
   * which is updated by gridtime and talk.
   * @param messages
   */
  updateStateMessages(messages) {
    this.setState({
      messages: messages
    });
    this.circuitFeedComponent.setState({
      messages: messages
    });
  }

  /**
   * updates our circuit members array in our component states
   * @param circuitMembers
   */
  updateStateCircuitMembers(circuitMembers) {
    this.setState({
      circuitMembers: circuitMembers
    });
    this.circuitSidebarComponent.setState({
      circuitMembers: circuitMembers
    });
    this.circuitFeedComponent.setState({
      circuitMembers: circuitMembers
    });
  }

  /**
   * hides our resizable scrapbook in the feed panel
   */
  hideScrapbook = () => {
    this.setState({
      scrapbookVisible: false
    });
  };

  /**
   * shows our scrapbook in our feed panel
   */
  showScrapbook = () => {
    this.setState(prevState => ({
      scrapbookVisible: !prevState.scrapbookVisible
    }));
  };

  /**
   * gets our classname for the splitter panel
   * @returns {string}
   */
  getClassName() {
    return this.state.scrapbookVisible
      ? "content show"
      : "content hide";
  }

  /**
   * stores our circuit sidebar component into memory to access.
   * @param component
   */
  setCircuitSidebarComponent = component => {
    this.circuitSidebarComponent = component;
  };

  /**
   * stores our circuit feed component with all of our messages in memory to
   * access and update.
   * @param component
   */
  setCircuitFeedComponent = component => {
    this.circuitFeedComponent = component;
  };

  /**
   * renders our circuit content panel and resizable scrapbook
   * @returns {*}
   */
  getCircuitContentPanel() {
    return (
      <div id="component" className="circuitContentPanel">
        <SplitterLayout
          customClassName={this.getClassName()}
          primaryMinSize={DimensionController.getActiveCircuitContentFeedMinWidth()}
          secondaryMinSize={DimensionController.getActiveCircuitContentScrapbookMinWidth()}
          secondaryInitialSize={DimensionController.getActiveCircuitContentScrapbookMinWidthDefault()}
        >
          <div id="wrapper" className="activeCircuitFeed">
            <ActiveCircuitFeed
              resource={this.state.resource}
              circuit={this.state.model}
              set={this.setCircuitFeedComponent}
            />
          </div>
          <Transition
            visible={this.state.scrapbookVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
            <div
              id="wrapper"
              className="activeCircuitScrapbook"
            >
              <ActiveCircuitScrapbook
                resource={this.state.resource}
                hideScrapbook={this.hideScrapbook}
                model={this.state.model}
              />
            </div>
          </Transition>
        </SplitterLayout>
      </div>
    );
  }

  /**
   * gets our rendering content for the circuits sidebar that contains mod
   * actions and stuff like that.
   * @returns {*}
   */
  getCircuitSidebarContent() {
    return (
      <div id="component" className="circuitContentSidebar">
        <CircuitSidebar
          resource={this.state.resource}
          showScrapbook={this.showScrapbook}
          set={this.setCircuitSidebarComponent}
        />
      </div>
    );
  }

  /**
   * renders the default troubleshoot component in the console view
   */
  render() {
    return (
      <div
        id="component"
        className="circuitContent"
        style={{
          height: DimensionController.getActiveCircuitContentHeight()
        }}
      >
        <div id="wrapper" className="circuitContentPanel">
          {this.getCircuitContentPanel()}
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          {this.getCircuitSidebarContent()}
        </div>
      </div>
    );
  }
}
