import React, { Component } from "react";
import { DimensionController } from "../../../../../controllers/DimensionController";
import SplitterLayout from "react-splitter-layout";
import "react-splitter-layout/lib/index.css";
import RetroSidebar from "./RetroSidebar";
import ActiveRetroFeed from "./ActiveRetroFeed";
import { Transition } from "semantic-ui-react";
import { RendererControllerFactory } from "../../../../../controllers/RendererControllerFactory";
import { CircuitClient } from "../../../../../clients/CircuitClient";
import { MemberClient } from "../../../../../clients/MemberClient";
import { TalkToClient } from "../../../../../clients/TalkToClient";
import { BaseClient } from "../../../../../clients/BaseClient";
import { RendererEventFactory } from "../../../../../events/RendererEventFactory";
import UtilRenderer from "../../../../../UtilRenderer";
import PastTroubleshootFeed from "./PastTroubleshootFeed";

/**
 * this component is the tab panel wrapper for the console content
 */
export default class ActiveRetro extends Component {
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
    this.name = "[ActiveRetro]";
    this.animationType = "fade";
    this.animationDelay = 210;
    this.me = MemberClient.me;
    this.loadCount = 0;
    this.missingMemberLoadCount = 0;
    this.missingMembers = [];
    this.retroMessages = [];
    this.troubleshootMessages = [];
    this.circuitMembers = [];
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
      slidePanelVisible: true,
      model: null,
      retroMessages: [],
      troubleshootMessages: [],
      troubleshootFeedEvents: [],
      retroFeedEvents: [],
      status: [],
      circuitMembers: [],
      missingMembers: [],
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
    if (
      prevProps.resource.uri !== this.props.resource.uri
    ) {
      console.log(
        "URI change from: " +
          prevProps.resource.uri +
          " to " +
          this.props.resource.uri
      );

      let circuitName = this.props.resource.uriArr[1];
      this.loadCircuit(circuitName, null, []);
    }

    if (this.state.circuitState === "TROUBLESHOOT") {
      let that = this;
      setTimeout(function() {
        that.focusOnChatInput();
      }, 500);
    }
  }

  focusOnChatInput() {
    let element = document.getElementById(
      "activeRetroChatInput"
    );
    if (element) {
      element.focus();
    }
  }
  /**
   * updates and loads our circuit form gridtime
   * @param circuitName
   * @param model
   * @param messages
   */
  loadCircuit(circuitName, model, messages) {
    this.loadCount = 0;
    this.retroMessages = [];
    this.troubleshootMessages = [];
    this.circuitMembers = [];
    CircuitClient.getCircuitWithAllDetails(
      circuitName,
      this,
      arg => {
        this.model = arg.data;
        this.updateStateModels(this.model);
        TalkToClient.getAllTalkMessagesFromRoom(
          this.model.wtfTalkRoomName,
          this.model.wtfTalkRoomId,
          this,
          arg => {
            this.troubleshootMessages = arg.data;
            this.loadCount++;
            this.updateStateIfDoneLoading();
          }
        );

        if (this.model.retroTalkRoomId) {
          TalkToClient.getAllTalkMessagesFromRoom(
            this.model.retroTalkRoomName,
            this.model.retroTalkRoomId,
            this,
            arg => {
              this.retroMessages = arg.data;
              this.loadCount++;
              this.updateStateIfDoneLoading();
            }
          );
        } else {
          this.loadCount++;
          this.updateStateIfDoneLoading();
        }


        CircuitClient.loadCircuitMembers(
          circuitName,
          this.model.wtfTalkRoomId,
          this,
          arg => {
            this.circuitMembers = arg.data;
            this.loadCount++;

            this.updateStateIfDoneLoading();
          }
        );
      }
    );
  }

  /**
   * Make sure the state updates happen at the same time, so we dont load the chat
   * with incorrect profile pics, then fix it.  This loads the state at end, after loadcount == 2
   */
  updateStateIfDoneLoading() {
    if (this.loadCount === 3) {
      this.missingMemberNames = this.findMissingMembers(
        this.troubleshootMessages, this.retroMessages,
        this.circuitMembers
      );
      this.loadMissingMemberProfiles(
        this.missingMemberNames
      );

      console.log(
        "missing members = " +
          JSON.stringify(this.missingMemberNames)
      );

      let troubleshootFeedEvents = this.convertToFeedEvents("What's the problem?",
        this.model.openTime,
        this.troubleshootMessages
      );

      let retroFeedEvents = this.convertToFeedEvents("What made troubleshooting take so long?  What ideas do you have for improvement?",
        this.model.retroStartedTime,
        this.retroMessages
      );

      this.setState({
        circuitMembers: this.circuitMembers,
        troubleshootMessages: this.troubleshootMessages,
        troubleshootFeedEvents: troubleshootFeedEvents,
        retroMessages: this.retroMessages,
        retroFeedEvents: retroFeedEvents,
        slidePanelVisible: true
      });
    }
  }

  loadMissingMemberProfiles(missingUsernames) {
    this.missingMemberLoadCount = 0;

    for (let i = 0; i < missingUsernames.length; i++) {
      MemberClient.getMember(
        missingUsernames[i],
        this,
        arg => {
          this.missingMemberLoadCount++;
          if (!arg.error && arg.data) {
            this.missingMembers.push(arg.data);
          } else {
            console.error("Error: " + arg.error);
          }
          if (
            this.missingMemberLoadCount ===
            missingUsernames.length
          ) {
            this.setState({
              missingMembers: this.missingMembers
            });
          }
        }
      );
    }
  }

  findMissingMembers(messages, messages2, circuitMembers) {
    let uniqueUsernames = [];

    for (let i = 0; i < messages.length; i++) {
      let metaProps = messages[i].metaProps;
      let username =
        !!metaProps &&
        metaProps[
          ActiveRetroFeed.fromUserNameMetaPropsStr
        ];

      if (!uniqueUsernames.includes(username)) {
        uniqueUsernames.push(username);
      }
    }

    for (let i = 0; i < messages2.length; i++) {
      let metaProps = messages2[i].metaProps;
      let username =
        !!metaProps &&
        metaProps[
          ActiveRetroFeed.fromUserNameMetaPropsStr
          ];

      if (!uniqueUsernames.includes(username)) {
        uniqueUsernames.push(username);
      }
    }

    let missingMembers = [];

    for (let i = 0; i < uniqueUsernames.length; i++) {
      let member = this.getCircuitMemberForUsername(
        circuitMembers,
        uniqueUsernames[i]
      );
      if (member === null) {
        missingMembers.push(uniqueUsernames[i]);
      }
    }
    return missingMembers;
  }

  getCircuitMemberForUsername(circuitMembers, username) {
    for (let i = 0; i < circuitMembers.length; i++) {
      if (circuitMembers[i].username === username) {
        return circuitMembers[i];
      }
    }

    return null;
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
      case BaseClient.MessageTypes
        .CIRCUIT_MEMBER_STATUS_EVENT:
        this.handleCircuitMemberStatusEventMessage(arg);
        break;
      case BaseClient.MessageTypes.WTF_STATUS_UPDATE:
        this.handleWtfStatusUpdateMessage(arg);
        break;
      case BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS:
        let hasMessage = UtilRenderer.hasMessageByIdInArray(
          this.state.retroMessages,
          arg
        );
        if (!hasMessage) {
          this.appendChatMessage(arg);
        } else {
          console.log(
            "Duplicate talk message observed: " +
              JSON.stringify(arg)
          );
        }
        break;
      case BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT:
        let status = arg.data;
        switch (status[ActiveRetro.statusEventPropStr]) {
          case BaseClient.RoomMemberStatus.ROOM_MEMBER_JOIN:
            console.log("JOIN ROOM", status);
            // TODO add status message in the feed
            break;
          case BaseClient.RoomMemberStatus
            .ROOM_MEMBER_LEAVE:
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


      prevState.retroMessages.push(message);

      return {
        retroMessages: prevState.retroMessages,
        retroFeedEvents: that.addFeedEvent(
          prevState.retroFeedEvents,
          username,
          null,
          time,
          json.message
        )
      };
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
      metaProps[ActiveRetroFeed.fromUserNameMetaPropsStr]
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
      roomMember = data[ActiveRetro.roomMemberPropStr];

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
      circuit = data[ActiveRetro.learningCircuitDtoStr],
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
   * updates our Chat Messages that our in our messages array. This is generally setup initially
   * by our mount or update component functions
   */
  convertToFeedEvents = (ferviePromptStr, startedTimestamp, messages) => {
    let metaProps = null,
      username = null,
      time = null,
      json = null,
      messagesLength = messages.length;

    const feedEvents = [];

    this.addFerviePrompt(ferviePromptStr, feedEvents, startedTimestamp);

    for (let i = 0, m = null; i < messagesLength; i++) {
      m = messages[i];
      metaProps = m.metaProps;
      username =
        !!metaProps &&
        metaProps[
          ActiveRetroFeed.fromUserNameMetaPropsStr
        ];
      time = UtilRenderer.getChatMessageTimeString(
        m.messageTime
      );
      json = m.data;

      if (
        m.messageType ===
        BaseClient.MessageTypes.CHAT_MESSAGE_DETAILS
      ) {
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
  addFerviePrompt(ferviePromptStr, feedEvents, timeStamp) {
      let time = UtilRenderer.getChatMessageTimeString(timeStamp);

      this.addFeedEvent(
        feedEvents,
        "Fervie",
        null,
        time,
        ferviePromptStr
      );
  }

  /**
   * Add a new feed events array which is used to generate the list of
   * feed events in the gui which displays all of the chat messages
   * @param username
   * @param feedEvent
   * @param time
   * @param text
   */
  addFeedEvent(
    feedEvents,
    username,
    feedEvent,
    time,
    text
  ) {
    if (
      feedEvents.length > 0 &&
      feedEvents[feedEvents.length - 1] &&
      feedEvents[feedEvents.length - 1].name === username
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
  hideSlidePanel = () => {
    this.setState({
      slidePanelVisible: false
    });
  };

  /**
   * shows our scrapbook in our feed panel
   */
  toggleSlidePanel = () => {
    this.setState(prevState => ({
      slidePanelVisible: !prevState.slidePanelVisible
    }));
  };

  /**
   * gets our classname for the splitter panel
   * @returns {string}
   */
  getClassName() {
    return this.state.slidePanelVisible
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
  getInRetroCircuitContentPanel() {
    console.log("in retro = "+UtilRenderer.isCircuitInRetro(this.state.model));
    return (
      <div id="component" className="circuitContentPanel">
        <SplitterLayout
          customClassName={this.getClassName()}
          primaryMinSize={DimensionController.getActiveCircuitContentFeedMinWidth()}
          secondaryMinSize={DimensionController.getActiveCircuitContentScrapbookMinWidth()}
          secondaryInitialSize={DimensionController.getActiveCircuitContentRetroSlideMinWidthDefault()}
        >
          <ActiveRetroFeed
            resource={this.props.resource}
            model={this.state.model}
            circuitState={this.state.circuitState}
            circuitMembers={this.state.circuitMembers}
            missingMembers={this.state.missingMembers}
            feedEvents={this.state.retroFeedEvents}
            set={this.setCircuitFeedComponent}
          />
          <Transition
            visible={this.state.slidePanelVisible}
            animation={this.animationType}
            duration={this.animationDelay}
          >
              <PastTroubleshootFeed
                resource={this.props.resource}
                model={this.state.model}
                circuitState={this.state.circuitState}
                circuitMembers={this.state.circuitMembers}
                missingMembers={this.state.missingMembers}
                feedEvents={this.state.troubleshootFeedEvents}
                hideSlidePanel={this.hideSlidePanel}
              />
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
        <RetroSidebar
          resource={this.props.resource}
          model={this.state.model}
          circuitMembers={this.state.circuitMembers}
          toggleSidePanel={this.toggleSlidePanel}
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
          {
            this.getInRetroCircuitContentPanel()
          }
        </div>
        <div id="wrapper" className="circuitContentSidebar">
          {this.getCircuitSidebarContent()}
        </div>
      </div>
    );
  }
}