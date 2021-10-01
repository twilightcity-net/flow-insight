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
import UtilRenderer from "../../../../../UtilRenderer";

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
   * the status event property name that talk uses for talk room status
   * @type {string}
   */
  static statusEventPropStr = "statusEvent";

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
      scrapbookVisible: false,
      model: null,
      messages: [],
      feedEvents: [],
      status: [],
      circuitMembers: [],
      circuitState: null
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
   * Updates the state of the circuit, based on a state change, or the resource uri
   * changing entirely
   * @param prevProps
   * @param prevState
   * @param snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
      if (prevProps.resource.uri !== this.props.resource.uri) {
          console.log("URI change from: "+prevProps.resource.uri + " to "+ this.props.resource.uri);

          let circuitName = this.props.resource.uriArr[1];
          this.loadCircuit(circuitName, null, []);
      }
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
            this.updateStateFeedEventsFromMessages(model, arg.data);
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
    UtilRenderer.clearIntervalTimer(this.wtfTimer);
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
      case BaseClient.MessageTypes.CIRCUIT_MEMBER_STATUS_EVENT:
        this.handleCircuitMemberStatusEventMessage(arg);
        break;
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        this.handleWtfStatusUpdateMessage(arg);
        break;
      case BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS:

        let hasMessage = UtilRenderer.hasMessageByIdInArray(this.state.messages, arg);
        if (!hasMessage) {
            this.appendChatMessage(arg);
        } else {
          console.log("Duplicate talk message observed: "+JSON.stringify(arg));
        }
        break;
      case BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT:
          let status = arg.data;
          switch (
              status[ActiveCircuit.statusEventPropStr]
              ) {
              case BaseClient.RoomMemberStatus.ROOM_MEMBER_JOIN:
                  console.log("JOIN ROOM", status);
                  // TODO add status message in the feed
                  break;
              case BaseClient.RoomMemberStatus.ROOM_MEMBER_LEAVE:
                  console.log("LEAVE ROOM", status);

                  // TODO add status message in the feed
                  break;
              default:
                  break;
          }
          break;
      default:
        break;
    }
  };


    /**
     * adds a chat message to the end of all of our chat
     * message feed events, and update the gui. This assumes we have
     * already loaded the circuit resource view.
     * @param message
     */
    appendChatMessage(message) {
        let metaProps = message.metaProps,
            username = this.getUsernameFromMetaProps(metaProps),
            time = UtilRenderer.getChatMessageTimeString(
                message.messageTime
            ),
            json = message.data;

        let that = this;

        this.setState(prevState => {
            //if this is our first message, then use it to update the description
            if (prevState.messages && prevState.messages.length === 0) {
                CircuitClient.updateCircuitDescription(
                    prevState.model.circuitName,
                    message.data.message,
                    that,
                    arg => {}
                );
            }

            prevState.messages.push(message);

            return {
                messages : prevState.messages,
                feedEvents :
                    that.addFeedEvent(
                        prevState.feedEvents,
                        username,
                        null,
                        time,
                        json.message)
            }
        });

    }

  /**
   * renders our username from the talk message's meta-prop which contains
   * the string of this.
   * @param metaProps
   * @returns {boolean|*}
   */
  getUsernameFromMetaProps(metaProps) {
      return (
          !!metaProps &&
          metaProps[ActiveCircuitFeed.fromUserNameMetaPropsStr]
      );
  }

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
      model = Object.assign(model, circuit);
      this.updateStateModelsOnTalkMessageUpdate(model);
    }
  }

  /**
   * updates our models in our various child components states. This
   * utilizes callback functions which are way faster then using refs
   * @param model
   */
  updateStateModelsOnTalkMessageUpdate(model) {
    this.setState({
      model: model,
      circuitState: model.circuitState
    });
  }

  /**
   * updates our models in our various child components states. This
   * utilizes callback functions which are way faster then using refs
   * @param model
   */
  updateStateModels(model) {
    this.setState({
      model: model,
      circuitState: model.circuitState
    });
  }

  /**
   * updates our components states with our updated array of chat messages
   * which is updated by gridtime and talk.
   * @param messages
   */
  updateStateFeedEventsFromMessages(circuit, messages) {

    let feedEvents = this.convertToFeedEvents(circuit, messages);

    this.setState({
        messages: messages,
        feedEvents: feedEvents
    });
  }

    /**
     * updates our Chat Messages that our in our messages array. This is generally setup initially
     * by our mount or update component functions
     */
    convertToFeedEvents = (circuit, messages) => {
        let metaProps = null,
            username = null,
            time = null,
            json = null,
            messagesLength = messages.length;

        const feedEvents = [];

        this.addFerviePrompt(feedEvents, circuit);

        for (let i = 0, m = null; i < messagesLength; i++) {
            m = messages[i];
            metaProps = m.metaProps;
            username =
                !!metaProps &&
                metaProps[
                    ActiveCircuitFeed.fromUserNameMetaPropsStr
                    ];
            time = UtilRenderer.getChatMessageTimeString(
                m.messageTime
            );
            json = m.data;

            if (m.messageType === BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS ) {
                this.addFeedEvent(
                    feedEvents,
                    username,
                    null,
                    time,
                    json.message
                );
            }
        }

        return feedEvents;
    };


    /**
     * Create the fervie "What's the problem?" prompt in chat
     * @param circuit
     */
    addFerviePrompt(feedEvents, circuit) {
        if (circuit) {
            let time = UtilRenderer.getChatMessageTimeString(
                circuit.openTime
            );

            this.addFeedEvent(
                feedEvents,
                "Fervie",
                null,
                time,
                "What's the problem?"
            );
        }
    }

    /**
     * Add a new feed events array which is used to generate the list of
     * feed events in the gui which displays all of the chat messages
     * @param username
     * @param feedEvent
     * @param time
     * @param text
     */
    addFeedEvent(feedEvents, username, feedEvent, time, text) {
        if (
            feedEvents.length > 0 &&
            feedEvents[feedEvents.length - 1] &&
            feedEvents[feedEvents.length - 1].name ===
            username
        ) {
            feedEvent = feedEvents.pop();
            feedEvent.text.push(text);
        } else {
            feedEvent = {
                name: username,
                time: time,
                text: [text]
            };
        }

        feedEvents.push(feedEvent);

        return feedEvents;
    }
    /**
   * updates our circuit members array in our component states
   * @param circuitMembers
   */
  updateStateCircuitMembers(circuitMembers) {
    this.setState({
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
              resource={this.props.resource}
              model={this.state.model}
              circuitState={this.state.circuitState}
              circuitMembers={this.state.circuitMembers}
              feedEvents={this.state.feedEvents}
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
                resource={this.props.resource}
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
          resource={this.props.resource}
          model={this.state.model}
          circuitMembers={this.state.circuitMembers}
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
